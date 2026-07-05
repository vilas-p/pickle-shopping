package com.appaamma.pickles.api.v1.customerauth;

import com.appaamma.pickles.api.v1.customerauth.dto.CustomerAuthResponse;
import com.appaamma.pickles.api.v1.customerauth.dto.RequestOtpRequest;
import com.appaamma.pickles.api.v1.customerauth.dto.RequestOtpResponse;
import com.appaamma.pickles.api.v1.customerauth.dto.UpdateCustomerProfileRequest;
import com.appaamma.pickles.api.v1.customerauth.dto.VerifyOtpRequest;
import com.appaamma.pickles.api.v1.notification.event.UserRegisteredEvent;
import com.appaamma.pickles.domain.audit.AuditLogService;
import com.appaamma.pickles.domain.customer.Customer;
import com.appaamma.pickles.domain.customer.CustomerRepository;
import com.appaamma.pickles.domain.otp.OtpIdentifierKind;
import com.appaamma.pickles.domain.otp.OtpPurpose;
import com.appaamma.pickles.exception.BadRequestException;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import com.appaamma.pickles.security.CustomerJwtTokenProvider;
import com.appaamma.pickles.security.CustomerPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerAuthService {

    private final OtpService otpService;
    private final CustomerRepository customerRepository;
    private final CustomerJwtTokenProvider tokenProvider;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final AuditLogService auditLogService;

    @Transactional
    public RequestOtpResponse requestLoginOtp(RequestOtpRequest req, HttpServletRequest http) {
        String clientIp = clientIp(http);
        OtpService.IssueResult result = otpService.issue(
                req.kind(),
                req.identifier(),
                OtpPurpose.LOGIN,
                clientIp,
                truncate(http.getHeader("User-Agent"), 500)
        );
        log.info("Login OTP requested: kind={} channel={} ip={}", req.kind(), result.channel(), clientIp);
        return new RequestOtpResponse(result.channel(), result.expiresAt(), result.debugCode());
    }

    @Transactional
    public RequestOtpResponse resendLoginOtp(RequestOtpRequest req, HttpServletRequest http) {
        return requestLoginOtp(req, http);
    }

    /**
     * Verifies the OTP and issues a customer JWT. If no customer record exists for the
     * identifier, one is created on-the-fly using {@code fullName} (required for first-time
     * login). Returning customers do not need to resubmit their name — the stored value wins.
     */
    @Transactional
    public CustomerAuthResponse verifyAndIssueToken(VerifyOtpRequest req, HttpServletRequest http) {
        String clientIp = clientIp(http);
        String normalised = otpService.verify(req.kind(), req.identifier(), OtpPurpose.LOGIN, req.code(), clientIp);
        Customer customer = (req.kind() == OtpIdentifierKind.PHONE)
                ? findOrCreateByPhone(normalised, req.fullName())
                : findOrCreateByEmail(normalised, req.fullName());

        String token = tokenProvider.generateToken(customer.getId(), customer.getPhone(), customer.getEmail());
        log.info("Customer authenticated: customerId={} kind={} ip={}", customer.getId(), req.kind(), clientIp);
        auditLogService.log(
            "CUSTOMER_LOGIN_SUCCEEDED",
            "Customer",
            String.valueOf(customer.getId()),
            Map.of("kind", req.kind().name(), "ipAddress", clientIp)
        );
        return new CustomerAuthResponse(
                token,
                "Bearer",
                tokenProvider.getExpirationMs(),
                new CustomerAuthResponse.CustomerSummary(
                        customer.getId(), customer.getFullName(), customer.getEmail(), customer.getPhone())
        );
    }

    @Transactional(readOnly = true)
    public CustomerAuthResponse.CustomerSummary me(CustomerPrincipal principal) {
        Customer c = customerRepository.findById(principal.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", principal.customerId()));
        return new CustomerAuthResponse.CustomerSummary(c.getId(), c.getFullName(), c.getEmail(), c.getPhone());
    }

    @Transactional
    public CustomerAuthResponse.CustomerSummary updateMe(CustomerPrincipal principal, UpdateCustomerProfileRequest request) {
        Customer customer = customerRepository.findById(principal.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", principal.customerId()));

        String email = request.email().trim().toLowerCase();
        String phone = normalisePhone(request.phone());

        customerRepository.findByEmailIgnoreCase(email)
                .filter(existing -> !existing.getId().equals(customer.getId()))
                .ifPresent(existing -> {
                    throw new BadRequestException("That email address is already linked to another account");
                });

        customerRepository.findByPhone(phone)
                .filter(existing -> !existing.getId().equals(customer.getId()))
                .ifPresent(existing -> {
                    throw new BadRequestException("That phone number is already linked to another account");
                });

        customer.setFullName(request.fullName().trim());
        customer.setEmail(email);
        customer.setPhone(phone);

        Customer saved = customerRepository.save(customer);
        auditLogService.log(
            "CUSTOMER_PROFILE_UPDATED",
            "Customer",
            String.valueOf(saved.getId()),
            Map.of("email", saved.getEmail(), "phone", saved.getPhone())
        );
        return new CustomerAuthResponse.CustomerSummary(
                saved.getId(),
                saved.getFullName(),
                saved.getEmail(),
                saved.getPhone()
        );
    }

    private Customer findOrCreateByPhone(String phone, String fullName) {
        return customerRepository.findByPhone(phone).orElseGet(() -> {
            String resolvedName = requireName(fullName);
            Customer saved = customerRepository.save(Customer.builder()
                    .fullName(resolvedName)
                    .phone(phone)
                    // Email is required on the entity; until they add one we synthesise a
                    // unique placeholder. Their profile screen prompts for the real address.
                    .email("pending+" + phone + "@appaamma.local")
                    .build());
            publishUserRegistered(saved);
            return saved;
        });
    }

    private Customer findOrCreateByEmail(String email, String fullName) {
        return customerRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            String resolvedName = requireName(fullName);
            Customer saved = customerRepository.save(Customer.builder()
                    .fullName(resolvedName)
                    .email(email)
                    .phone(generatePlaceholderPhone(email))
                    .build());
            publishUserRegistered(saved);
            return saved;
        });
    }

    private String requireName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            throw new BadRequestException("Full name is required to create a new account");
        }
        return fullName.trim();
    }

    private void publishUserRegistered(Customer customer) {
        applicationEventPublisher.publishEvent(new UserRegisteredEvent(
                customer.getFullName(),
                customer.getEmail(),
                customer.getPhone()
        ));
        log.info("Customer account created: customerId={}", customer.getId());
        auditLogService.log(
                "CUSTOMER_REGISTERED",
                "Customer",
                String.valueOf(customer.getId()),
                Map.of("email", customer.getEmail(), "phone", customer.getPhone())
        );
    }

    private String truncate(String value, int max) {
        if (value == null) return null;
        return value.length() <= max ? value : value.substring(0, max);
    }

    private String normalisePhone(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    private String generatePlaceholderPhone(String email) {
        long positiveHash = Integer.toUnsignedLong(email.toLowerCase().hashCode());
        return String.format("99%08d", positiveHash % 100_000_000L);
    }

    private String clientIp(HttpServletRequest request) {
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }
}
