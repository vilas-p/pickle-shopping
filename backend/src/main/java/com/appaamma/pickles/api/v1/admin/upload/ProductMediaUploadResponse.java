package com.appaamma.pickles.api.v1.admin.upload;

import com.appaamma.pickles.domain.product.ProductMediaType;

public record ProductMediaUploadResponse(
        String key,
        String url,
        ProductMediaType mediaType,
        String contentType,
        long size
) {
}