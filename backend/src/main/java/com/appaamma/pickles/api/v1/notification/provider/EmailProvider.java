package com.appaamma.pickles.api.v1.notification.provider;

import com.appaamma.pickles.domain.notification.EmailProviderType;

public interface EmailProvider {
    EmailProviderType type();
    NotificationProviderResponse send(String emailAddress, String subject, String body);
}