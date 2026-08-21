package com.appaamma.pickles.api.v1.admin.media;

import com.appaamma.pickles.domain.media.MediaCategory;
import com.appaamma.pickles.domain.product.ProductMediaType;

import java.time.Instant;

public record MediaResponse(
        Long id,
        String originalFilename,
        String s3Key,
        String url,
        String contentType,
        ProductMediaType mediaType,
        Long fileSize,
        MediaCategory category,
        Long productId,
        String altText,
        Integer displayOrder,
        boolean active,
        Long uploadedBy,
        Instant createdAt,
        Instant updatedAt
) {}
