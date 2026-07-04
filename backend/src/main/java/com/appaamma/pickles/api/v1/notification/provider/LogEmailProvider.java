package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.domain.notification.EmailProviderType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class LogEmailProvider implements EmailProvider {

    @Override
    public EmailProviderType type() {
        return EmailProviderType.LOG;
    }

    @Override
    public NotificationProviderResponse send(String emailAddress, String subject, String body) {
        log.warn("[EMAIL:LOG] to={} subject={} body={}", emailAddress, subject, body);
        return new NotificationProviderResponse("log-email", null, "logged");
    }
}