package com.appaamma.pickles.api.v1.inventory.dto;

public record InventoryResponse(
        Long id,
        Long productId,
        String productName,
        Long variantId,
        String variantWeight,
        Integer quantityAvailable,
        Integer reorderLevel,
        String batchCode,
        boolean lowStock
) {}
