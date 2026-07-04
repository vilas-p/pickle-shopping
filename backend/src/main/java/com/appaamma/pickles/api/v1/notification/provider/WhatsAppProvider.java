package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.domain.notification.WhatsAppProviderType;

public interface WhatsAppProvider {
    WhatsAppProviderType type();
    NotificationProviderResponse send(String phoneNumber, String message);
}