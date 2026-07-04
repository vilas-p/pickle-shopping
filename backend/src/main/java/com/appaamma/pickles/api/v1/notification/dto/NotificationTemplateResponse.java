package com.appaamma.pickles.api.v1.notification.dto;

import com.appaamma.pickles.domain.notification.NotificationChannel;

import java.time.Instant;

public record NotificationTemplateResponse(
        Long id,
        String templateCode,
        NotificationChannel channel,
        String locale,
        String subjectTemplate,
        String bodyTemplate,
        String description,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}