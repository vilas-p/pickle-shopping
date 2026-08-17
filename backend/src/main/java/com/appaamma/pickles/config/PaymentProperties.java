package com.appaamma.pickles.config;

import jakarta.validation.constraints.NotBlank;

public class PaymentProperties {

    @NotBlank
    private String keyId;

    @NotBlank
    private String keySecret;

    @NotBlank
    private String webhookSecret;

    public PaymentProperties(String keyId, String keySecret, String webhookSecret) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.webhookSecret = webhookSecret;
    }

    public String getKeyId() {
        return keyId;
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }

    public String getKeySecret() {
        return keySecret;
    }

    public void setKeySecret(String keySecret) {
        this.keySecret = keySecret;
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }

    public void setWebhookSecret(String webhookSecret) {
        this.webhookSecret = webhookSecret;
    }
}
