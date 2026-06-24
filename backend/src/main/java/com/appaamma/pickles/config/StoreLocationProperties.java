package com.appaamma.pickles.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.store-location")
public record StoreLocationProperties(
        String label,
        String line1,
        String city,
        String state,
        String pincode
) {
}