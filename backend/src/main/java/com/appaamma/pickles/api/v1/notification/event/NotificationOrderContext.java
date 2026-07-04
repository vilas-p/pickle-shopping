package com.appaamma.pickles.api.v1.notification.event;

import java.math.BigDecimal;

public record NotificationOrderContext(
        String customerName,
        String email,
        String phone,
        String orderId,
        BigDecimal amount,
        String items,
        String trackingNumber,
        String trackingUrl,
        String reviewLink
) {
}