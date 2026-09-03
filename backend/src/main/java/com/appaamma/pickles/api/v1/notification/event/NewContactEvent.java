package com.appaamma.pickles.api.v1.notification.event;

public record NewContactEvent(
        String fullName,
        String email,
        String phone,
        String subject,
        String message
) {
}
