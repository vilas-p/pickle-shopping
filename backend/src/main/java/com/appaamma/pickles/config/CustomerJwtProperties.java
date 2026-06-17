package com.appaamma.pickles.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Separate signing secret + lifetime for customer (storefront) JWTs. Kept distinct from
 * {@link JwtProperties} so admin and customer tokens cannot be substituted for one another
 * and so they can be rotated on independent schedules.
 */
@Validated
@ConfigurationProperties(prefix = "app.customer-jwt")
public record CustomerJwtProperties(
        @NotBlank @Size(min = 32, message = "Customer JWT secret must be at least 32 characters") String secret,
        @Min(60_000) long expirationMs
) {}
