package com.appaamma.pickles.api.v1.payment.dto;

import java.math.BigDecimal;

public record PaymentOrderResponse(
        String razorpayOrderId,
        BigDecimal amount,
        String currency,
        String razorpayKeyId,
        String orderNumber,
        String customerName,
        String customerEmail,
        String customerPhone
) {}
