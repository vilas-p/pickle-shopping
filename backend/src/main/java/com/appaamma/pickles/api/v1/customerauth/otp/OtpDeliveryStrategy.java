package com.appaamma.pickles.api.v1.customerauth.otp;

import com.appaamma.pickles.domain.otp.OtpIdentifierKind;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Strategy interface for OTP delivery and verification. Each provider decides both
 * how a code is sent and how a submitted code is validated.
 */
public interface OtpDeliveryStrategy {

    /**
     * Delivers OTP to the recipient.
     *
     * @param kind          identifier kind (PHONE or EMAIL)
     * @param recipient     normalised phone number or email
     * @param otp           the OTP code
     * @param expiryMinutes TTL in minutes
     * @return channel name used for delivery
     */
    String deliver(OtpIdentifierKind kind, String recipient, String otp, long expiryMinutes);

    /**
     * @return provider code this strategy handles
     */
    String getProviderCode();

    /**
     * Validates a submitted code against the stored hash. Real providers must match the hash;
     * default implementation does exactly that.
     */
    default boolean verify(String submittedCode, String codeHash, int expectedLength, PasswordEncoder passwordEncoder) {
        return passwordEncoder.matches(submittedCode, codeHash);
    }
}
