package com.appaamma.pickles.api.v1.admin.media;

public record MediaUpdateRequest(
        String altText,
        Integer displayOrder,
        Boolean active
) {}
