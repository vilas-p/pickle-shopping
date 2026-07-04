package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.domain.notification.SmsProviderType;

public interface SmsProvider {
    SmsProviderType type();
    NotificationProviderResponse send(String phoneNumber, String message);
}