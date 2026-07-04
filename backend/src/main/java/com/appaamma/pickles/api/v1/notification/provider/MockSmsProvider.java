package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.domain.notification.SmsProviderType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MockSmsProvider implements SmsProvider {

    private final MockNotificationSupport mockNotificationSupport;

    @Override
    public SmsProviderType type() {
        return SmsProviderType.MOCK;
    }

    @Override
    public NotificationProviderResponse send(String phoneNumber, String message) {
        return mockNotificationSupport.capture("SMS", phoneNumber, null, message);
    }
}