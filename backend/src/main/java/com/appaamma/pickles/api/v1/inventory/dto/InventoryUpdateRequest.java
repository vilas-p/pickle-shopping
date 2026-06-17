package com.appaamma.pickles.api.v1.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InventoryUpdateRequest(
        @NotNull @Min(0) Integer quantityAvailable,
        @Min(0) Integer reorderLevel,
        @Size(max = 100) String batchCode
) {}
