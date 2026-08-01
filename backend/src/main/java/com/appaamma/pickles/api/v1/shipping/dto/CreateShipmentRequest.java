package com.appaamma.pickles.api.v1.shipping.dto;

import jakarta.validation.constraints.NotNull;

public record CreateShipmentRequest(
        @NotNull Long orderId,
        Integer courierId
) {}
