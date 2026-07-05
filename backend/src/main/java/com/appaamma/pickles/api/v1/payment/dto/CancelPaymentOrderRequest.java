package com.appaamma.pickles.api.v1.payment.dto;

import jakarta.validation.constraints.NotBlank;

public record CancelPaymentOrderRequest(
        @NotBlank String razorpayOrderId
) {}