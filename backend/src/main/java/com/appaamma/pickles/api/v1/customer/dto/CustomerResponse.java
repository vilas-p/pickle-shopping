package com.appaamma.pickles.api.v1.customer.dto;

import java.time.Instant;

public record CustomerResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        Instant createdAt
) {}
