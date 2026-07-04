package com.appaamma.pickles.api.v1.notification.provider;

public record NotificationProviderResponse(
        String providerName,
        String externalMessageId,
        String rawResponse
) {
}