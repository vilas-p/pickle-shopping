package com.appaamma.pickles.security;

/**
 * Authenticated customer principal exposed via {@code @AuthenticationPrincipal} on
 * controller methods. Intentionally minimal — for any further fields we hit the repository.
 */
public record CustomerPrincipal(Long customerId, String phone, String email) {}
