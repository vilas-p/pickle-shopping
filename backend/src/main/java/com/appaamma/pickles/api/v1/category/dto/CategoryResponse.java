package com.appaamma.pickles.api.v1.category.dto;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        boolean active
) {}
