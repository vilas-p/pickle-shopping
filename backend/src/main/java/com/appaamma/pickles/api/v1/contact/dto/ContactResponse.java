package com.appaamma.pickles.api.v1.contact.dto;

import java.time.Instant;

public record ContactResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String subject,
        String message,
        boolean handled,
        Instant createdAt
) {}
