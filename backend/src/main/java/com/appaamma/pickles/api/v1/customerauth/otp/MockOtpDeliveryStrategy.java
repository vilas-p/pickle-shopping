package com.appaamma.pickles.api.v1.customerauth.otp;

import com.appaamma.pickles.domain.otp.OtpIdentifierKind;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Mock OTP delivery - logs OTP to console for development/testing.
 */
@Slf4j
@Component
public class MockOtpDeliveryStrategy implements OtpDeliveryStrategy {

    public static final String PROVIDER_CODE = "MOCK";

    @Override
    public String deliver(OtpIdentifierKind kind, String recipient, String otp, long expiryMinutes) {
        if (kind == OtpIdentifierKind.EMAIL) {
            log.info("[MOCK EMAIL OTP] To: {} | OTP: {} | Expires in {} minutes", recipient, otp, expiryMinutes);
            return "mock-email";
        }
        log.info("[MOCK OTP] To: {} | OTP: {} | Expires in {} minutes", recipient, otp, expiryMinutes);
        return "mock";
    }

    @Override
    public String getProviderCode() {
        return PROVIDER_CODE;
    }

    // Mock mode only checks that the submitted code has the expected number of digits.
    @Override
    public boolean verify(String submittedCode, String codeHash, int expectedLength, PasswordEncoder passwordEncoder) {
        return submittedCode != null && submittedCode.matches("\\d{" + expectedLength + "}");
    }
}
