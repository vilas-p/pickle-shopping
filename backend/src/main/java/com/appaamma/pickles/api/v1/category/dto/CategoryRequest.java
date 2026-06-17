package com.appaamma.pickles.api.v1.category.dto;

import jakarta.validation.constraints.*;

public record CategoryRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 120) @Pattern(regexp = "^[a-z0-9-]+$") String slug,
        @Size(max = 500) String description,
        boolean active
) {}
