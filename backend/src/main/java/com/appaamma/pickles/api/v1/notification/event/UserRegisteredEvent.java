package com.appaamma.pickles.api.v1.notification.event;

public record UserRegisteredEvent(
        String customerName,
        String email,
        String phone
) {
}