package com.appaamma.pickles.api.v1.inventory;

import com.appaamma.pickles.api.v1.inventory.dto.InventoryResponse;
import com.appaamma.pickles.api.v1.inventory.dto.InventoryUpdateRequest;
import com.appaamma.pickles.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Inventory", description = "[Admin] Inventory tracking")
@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
public class InventoryController {

    private final InventoryService inventoryService;

    @Operation(summary = "List inventory across all products")
    @GetMapping
    public ApiResponse<List<InventoryResponse>> list() {
        return ApiResponse.ok(inventoryService.listAll());
    }

    @Operation(summary = "List items at/below the given threshold (default 10)")
    @GetMapping("/low-stock")
    public ApiResponse<List<InventoryResponse>> lowStock(@RequestParam(defaultValue = "10") int threshold) {
        return ApiResponse.ok(inventoryService.lowStock(threshold));
    }

    @Operation(summary = "Create or update inventory for a product")
    @PutMapping("/product/{productId}")
    public ApiResponse<InventoryResponse> upsert(@PathVariable Long productId,
                                                  @Valid @RequestBody InventoryUpdateRequest request) {
        return ApiResponse.ok(inventoryService.upsert(productId, request), "Updated");
    }
}
