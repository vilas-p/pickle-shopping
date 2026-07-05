package com.appaamma.pickles.api.v1.customerauth;

import com.appaamma.pickles.config.OtpProperties;
import com.appaamma.pickles.api.v1.notification.event.LoginOtpRequestedEvent;
import com.appaamma.pickles.domain.otp.*;
import com.appaamma.pickles.exception.BadRequestException;
import com.appaamma.pickles.exception.TooManyRequestsException;
import com.appaamma.pickles.security.RequestRateLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;

/**
 * Issues and verifies OTP codes. All persistence operations are transactional. The code is
 * never persisted in plaintext — only the bcrypt hash. Per-identifier rate limits and
 * per-token attempt caps are enforced server-side.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final int MAX_REQUESTS_PER_IP_WINDOW = 20;
    private static final int MAX_VERIFY_ATTEMPTS_PER_IP_WINDOW = 25;
    private static final int MAX_VERIFY_ATTEMPTS_PER_IDENTIFIER_WINDOW = 10;

    private final OtpRepository otpRepository;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final PasswordEncoder passwordEncoder;
    private final OtpProperties props;
    private final RequestRateLimiter requestRateLimiter;
    private final SecureRandom random = new SecureRandom();

    /**
     * Generates and dispatches a new OTP code for the given identifier + purpose.
     * Throws {@link BadRequestException} if the per-window rate limit is exceeded.
     */
    @Transactional
    public IssueResult issue(OtpIdentifierKind kind,
                             String identifier,
                             OtpPurpose purpose,
                             String ipAddress,
                             String userAgent) {
        String normalised = normalise(kind, identifier);

        requestRateLimiter.checkAndRecord(
            rateKey("otp-request-ip", ipAddress),
            MAX_REQUESTS_PER_IP_WINDOW,
            props.rateLimitWindow(),
            "Too many OTP requests from this device. Please try again later."
        );

        Instant windowStart = Instant.now().minus(props.rateLimitWindow());
        long recent = otpRepository.countSince(normalised, windowStart);
        if (recent >= props.rateLimitMaxPerWindow()) {
            throw new TooManyRequestsException(
                    "Too many OTP requests. Please try again in a few minutes.");
        }

        String code = generateNumericCode(props.codeLength());
        OtpToken token = OtpToken.builder()
                .identifier(normalised)
                .identifierKind(kind)
                .purpose(purpose)
                .codeHash(passwordEncoder.encode(code))
                .maxAttempts(props.maxAttempts())
                .expiresAt(Instant.now().plus(props.ttl()))
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
        otpRepository.save(token);

            String channel = kind == OtpIdentifierKind.PHONE ? "sms" : "email";
            applicationEventPublisher.publishEvent(new LoginOtpRequestedEvent(
                kind,
                normalised,
                "Customer",
                code,
                Math.max(1, props.ttl().toMinutes())
            ));
        log.info("OTP issued: purpose={} kind={} channel={} ttlSeconds={}",
                purpose, kind, channel, props.ttl().toSeconds());

            String debugCode = props.exposeDebugCode() ? code : null;
            return new IssueResult(channel, token.getExpiresAt(), debugCode);
    }

    /**
     * Verifies the submitted code against the latest usable OTP for the given identifier +
     * purpose. On success the token is marked consumed and the normalised identifier is
     * returned (e.g. lowercased email, digits-only phone). Failure increments the attempt
     * counter and throws.
     */
    @Transactional
        public String verify(OtpIdentifierKind kind, String identifier, OtpPurpose purpose, String submittedCode, String ipAddress) {
        String normalised = normalise(kind, identifier);
        requestRateLimiter.checkAndRecord(
            rateKey("otp-verify-ip", ipAddress),
            MAX_VERIFY_ATTEMPTS_PER_IP_WINDOW,
            props.rateLimitWindow(),
            "Too many OTP verification attempts. Please request a new code later."
        );
        requestRateLimiter.checkAndRecord(
            rateKey("otp-verify-id", normalised),
            MAX_VERIFY_ATTEMPTS_PER_IDENTIFIER_WINDOW,
            props.rateLimitWindow(),
            "Too many OTP verification attempts. Please request a new code later."
        );

        OtpToken token = otpRepository.findLatestUsable(normalised, purpose, Instant.now())
                .orElseThrow(() -> new BadRequestException(
                        "No active code for this number. Please request a new one."));

        if (!passwordEncoder.matches(submittedCode, token.getCodeHash())) {
            token.setAttempts(token.getAttempts() + 1);
            String message = token.getAttempts() < token.getMaxAttempts()
                ? "Invalid or expired code. Please try again."
                : "Too many incorrect attempts. Please request a new code.";
            throw new BadRequestException(message);
        }

        token.setConsumedAt(Instant.now());
        return normalised;
    }

    /**
     * Normalises an identifier the same way before storage and lookup so a token requested
     * for {@code +91 98765 43210} matches a verify call for {@code 919876543210}.
     */
    public String normalise(OtpIdentifierKind kind, String raw) {
        if (raw == null) throw new BadRequestException("Identifier is required");
        String trimmed = raw.trim();
        if (kind == OtpIdentifierKind.PHONE) {
            String digits = trimmed.replaceAll("\\D", "");
            if (digits.length() < 10 || digits.length() > 15) {
                throw new BadRequestException("Phone must be 10–15 digits");
            }
            return digits;
        }
        return trimmed.toLowerCase();
    }

    private String generateNumericCode(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    private String rateKey(String prefix, String value) {
        String safeValue = value == null || value.isBlank() ? "unknown" : value;
        return prefix + ':' + safeValue;
    }

    public record IssueResult(String channel, Instant expiresAt, String debugCode) {}
}
