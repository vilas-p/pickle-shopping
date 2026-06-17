package com.appaamma.pickles.api.v1.product.dto;

public record ProductImageResponse(
        Long id,
        String url,
        String altText,
        Integer displayOrder,
        boolean primary
) {}
