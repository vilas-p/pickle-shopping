package com.appaamma.pickles.api.v1.product.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record ProductRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Size(max = 180) @Pattern(regexp = "^[a-z0-9-]+$", message = "slug must be lowercase, alphanumeric, with hyphens")
        String slug,
        @NotBlank @Size(max = 1000) String shortDescription,
        String description,
        String ingredients,
        @Size(max = 100) String shelfLife,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal price,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal compareAtPrice,
        @NotBlank @Size(max = 50) String weight,
        @NotNull Long categoryId,
        boolean active,
        boolean featured,
        @Valid List<ProductImageRequest> images
) {
    public record ProductImageRequest(
            @NotBlank @Size(max = 500) String url,
            @Size(max = 200) String altText,
            Integer displayOrder,
            boolean primary
    ) {}
}
