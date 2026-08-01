package com.appaamma.pickles.api.v1.shipping.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record ServiceabilityRequest(
        @NotBlank String deliveryPincode,
        @Positive double weight,
        boolean cod
) {}
