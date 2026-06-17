package com.appaamma.pickles.api.v1.auth.dto;

import java.util.Set;

public record LoginResponse(
        String token,
        String tokenType,
        long expiresInMs,
        UserSummary user
) {
    public record UserSummary(Long id, String fullName, String email, Set<String> roles) {}
}
