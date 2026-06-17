package com.appaamma.pickles.api.v1.product.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
        Long id,
        String name,
        String slug,
        String shortDescription,
        String description,
        String ingredients,
        String shelfLife,
        BigDecimal price,
        BigDecimal compareAtPrice,
        String weight,
        boolean active,
        boolean featured,
        CategorySummary category,
        List<ProductImageResponse> images,
        List<VariantResponse> variants
) {
    public record CategorySummary(Long id, String name, String slug) {}
    public record VariantResponse(
            Long id,
            String weight,
            String sku,
            BigDecimal price,
            BigDecimal compareAtPrice,
            int displayOrder,
            boolean active
    ) {}
}
