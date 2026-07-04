package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.domain.notification.WhatsAppProviderType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MockWhatsAppProvider implements WhatsAppProvider {

    private final MockNotificationSupport mockNotificationSupport;

    @Override
    public WhatsAppProviderType type() {
        return WhatsAppProviderType.MOCK;
    }

    @Override
    public NotificationProviderResponse send(String phoneNumber, String message) {
        return mockNotificationSupport.capture("WHATSAPP", phoneNumber, null, message);
    }
}