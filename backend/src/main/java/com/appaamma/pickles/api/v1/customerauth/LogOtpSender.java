package com.appaamma.pickles.api.v1.customerauth;

import com.appaamma.pickles.domain.otp.OtpIdentifierKind;
import com.appaamma.pickles.domain.otp.OtpProviderType;
import com.appaamma.pickles.domain.otp.OtpPurpose;
import com.appaamma.pickles.domain.otp.OtpSender;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Default OTP sender used in dev and tests. Logs the code at WARN level so the developer
 * can copy it from the console. A different provider can be selected through
 * {@code app.otp.provider} without changing the service code.
 */
@Slf4j
@Component
public class LogOtpSender implements OtpSender {

    @Override
    public OtpProviderType type() {
        return OtpProviderType.DEV;
    }

    @Override
    public String send(OtpIdentifierKind kind, String identifier, String code, OtpPurpose purpose) {
        log.warn("[DEV OTP] {} {} for {}: code = {}", purpose, kind, identifier, code);
        return "dev-log";
    }
}
