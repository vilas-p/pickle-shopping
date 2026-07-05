package com.appaamma.pickles.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties(prefix = "app.otp")
public record OtpProperties(
        @Min(4) @Max(8) int codeLength,
        Duration ttl,
        @Min(1) @Max(10) int maxAttempts,
        @Min(1) int rateLimitMaxPerWindow,
        Duration rateLimitWindow,
        boolean exposeDebugCode,
        HttpProvider http
) {

    public OtpProperties {
        http = http == null ? new HttpProvider(null, "Authorization", null, "http", null) : http;
    }

    public record HttpProvider(
            String url,
            String authHeaderName,
            String authToken,
            String channelName,
            String messageTemplate
    ) {}
}
