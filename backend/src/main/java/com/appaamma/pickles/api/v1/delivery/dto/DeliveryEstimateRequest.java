package com.appaamma.pickles.api.v1.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record DeliveryEstimateRequest(
        @NotBlank String city,
        @NotBlank String state,
        @NotBlank
        @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Pincode must be 6 digits")
        String pincode
) {
}