package com.appaamma.pickles.api.v1.admin.media;

import com.appaamma.pickles.domain.product.ProductMediaType;

import java.time.Instant;

public record ProductImageResponse(
        Long id,
        String url,
        String s3Key,
        String altText,
        Integer displayOrder,
        boolean primary,
        ProductMediaType mediaType,
        Instant createdAt
) {}
