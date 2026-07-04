package com.appaamma.pickles.api.v1.notification.event;

import com.appaamma.pickles.domain.otp.OtpIdentifierKind;

public record LoginOtpRequestedEvent(
        OtpIdentifierKind kind,
        String recipient,
        String customerName,
        String otp,
        long expiryMinutes
) {
}