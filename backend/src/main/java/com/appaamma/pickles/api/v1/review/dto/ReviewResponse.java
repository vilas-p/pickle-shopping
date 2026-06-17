package com.appaamma.pickles.api.v1.review.dto;

import java.time.Instant;

public record ReviewResponse(
        Long id,
        Long productId,
        String productName,
        String authorName,
        String authorCity,
        Integer rating,
        String title,
        String body,
        boolean approved,
        Instant createdAt
) {}
