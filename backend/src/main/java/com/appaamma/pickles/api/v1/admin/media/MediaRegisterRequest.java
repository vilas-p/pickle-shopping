package com.appaamma.pickles.api.v1.admin.media;

import com.appaamma.pickles.domain.media.MediaCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MediaRegisterRequest(
        @NotBlank String s3Key,
        @NotNull MediaCategory category,
        Long productId,
        String altText,
        Integer displayOrder
) {}
