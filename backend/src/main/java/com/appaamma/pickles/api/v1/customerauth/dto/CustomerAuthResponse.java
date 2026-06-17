package com.appaamma.pickles.api.v1.customerauth.dto;

public record CustomerAuthResponse(
        String accessToken,
        String tokenType,
        long expiresInMs,
        CustomerSummary customer
) {
    public record CustomerSummary(Long id, String fullName, String email, String phone) {}
}
