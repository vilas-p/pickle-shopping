package com.appaamma.pickles.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.storage.s3")
public record S3StorageProperties(
        String bucket,
        String region,
        String accessKey,
        String secretKey,
        String endpointUrl,
        String publicBaseUrl,
        String productPrefix,
        long maxFileSizeBytes
) {
    public boolean isConfigured() {
        return hasText(bucket) && hasText(region) && hasText(accessKey) && hasText(secretKey);
    }

    public String normalizedProductPrefix() {
        if (!hasText(productPrefix)) return "products";
        return trimSlashes(productPrefix);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String trimSlashes(String value) {
        String normalized = value.trim();
        while (normalized.startsWith("/")) normalized = normalized.substring(1);
        while (normalized.endsWith("/")) normalized = normalized.substring(0, normalized.length() - 1);
        return normalized;
    }
}