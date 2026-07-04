package com.appaamma.pickles.api.v1.notification.dto;

import com.appaamma.pickles.domain.notification.NotificationChannel;
import com.appaamma.pickles.domain.notification.NotificationDispatchStatus;

import java.time.Instant;

public record NotificationLogResponse(
        Long id,
        String templateCode,
        NotificationChannel channel,
        String recipient,
        String subject,
        String renderedMessage,
        NotificationDispatchStatus status,
        String providerName,
        String providerResponse,
        String failureReason,
        int attemptCount,
        Instant createdAt
) {
}