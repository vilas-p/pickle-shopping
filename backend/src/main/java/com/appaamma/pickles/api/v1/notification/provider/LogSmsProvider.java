package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.domain.notification.SmsProviderType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class LogSmsProvider implements SmsProvider {

    @Override
    public SmsProviderType type() {
        return SmsProviderType.LOG;
    }

    @Override
    public NotificationProviderResponse send(String phoneNumber, String message) {
        log.warn("[SMS:LOG] to={} message={}", phoneNumber, message);
        return new NotificationProviderResponse("log-sms", null, "logged");
    }
}