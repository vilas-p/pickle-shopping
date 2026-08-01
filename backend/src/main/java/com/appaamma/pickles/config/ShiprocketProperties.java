package com.appaamma.pickles.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;

@Validated
@ConfigurationProperties(prefix = "app.shiprocket")
public record ShiprocketProperties(
        @NotBlank String email,
        @NotBlank String password,
        @NotBlank String baseUrl,
        int tokenRefreshHours,
        String webhookSecret,
        String pickupLocationId,
        String pickupPincode,
        BigDecimal defaultWeightKg,
        BigDecimal defaultLengthCm,
        BigDecimal defaultBreadthCm,
        BigDecimal defaultHeightCm,
        boolean autoCreateShipment,
        boolean autoAssignAwb,
        boolean autoSchedulePickup
) {}
