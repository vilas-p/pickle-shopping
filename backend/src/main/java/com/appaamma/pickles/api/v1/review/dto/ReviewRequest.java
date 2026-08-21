package com.appaamma.pickles.api.v1.review.dto;

import jakarta.validation.constraints.*;

public record ReviewRequest(
        @NotNull Long productId,
        @Size(max = 100) String authorCity,
        @NotNull @Min(1) @Max(5) Integer rating,
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 2000) String body
) {}
