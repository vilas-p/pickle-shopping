package com.appaamma.pickles.api.v1.product.dto;

import com.appaamma.pickles.domain.product.ProductMediaType;

public record ProductImageResponse(
        Long id,
        String url,
        String altText,
        Integer displayOrder,
        boolean primary,
        ProductMediaType mediaType
) {}
