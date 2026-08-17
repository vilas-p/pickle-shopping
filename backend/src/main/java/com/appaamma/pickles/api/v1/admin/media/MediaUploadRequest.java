package com.appaamma.pickles.api.v1.admin.media;

import com.appaamma.pickles.domain.media.MediaCategory;
import jakarta.validation.constraints.NotNull;

public record MediaUploadRequest(
        @NotNull MediaCategory category,
        Long productId,
        String altText,
        Integer displayOrder
) {}
