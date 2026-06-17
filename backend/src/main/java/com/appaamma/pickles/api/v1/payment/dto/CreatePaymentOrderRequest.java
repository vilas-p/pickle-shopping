package com.appaamma.pickles.api.v1.payment.dto;

import jakarta.validation.constraints.NotNull;

public record CreatePaymentOrderRequest(
        @NotNull Long orderId
) {}
