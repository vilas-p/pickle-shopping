package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.domain.notification.EmailProviderType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MockEmailProvider implements EmailProvider {

    private final MockNotificationSupport mockNotificationSupport;

    @Override
    public EmailProviderType type() {
        return EmailProviderType.MOCK;
    }

    @Override
    public NotificationProviderResponse send(String emailAddress, String subject, String body) {
        return mockNotificationSupport.capture("EMAIL", emailAddress, subject, body);
    }
}