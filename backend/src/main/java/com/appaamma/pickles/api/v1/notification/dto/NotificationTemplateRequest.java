package com.appaamma.pickles.api.v1.notification.dto;

import com.appaamma.pickles.domain.notification.NotificationChannel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record NotificationTemplateRequest(
        @NotBlank @Size(max = 120) String templateCode,
        @NotNull NotificationChannel channel,
        @NotBlank @Size(max = 20) String locale,
        @Size(max = 200) String subjectTemplate,
        @NotBlank String bodyTemplate,
        @Size(max = 500) String description,
        boolean active
) {
}