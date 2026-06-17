package com.appaamma.pickles.api.v1.inventory;

import com.appaamma.pickles.api.v1.inventory.dto.InventoryResponse;
import com.appaamma.pickles.api.v1.inventory.dto.InventoryUpdateRequest;
import com.appaamma.pickles.domain.inventory.Inventory;
import com.appaamma.pickles.domain.inventory.InventoryRepository;
import com.appaamma.pickles.domain.product.Product;
import com.appaamma.pickles.domain.product.ProductRepository;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<InventoryResponse> listAll() {
        return inventoryRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> lowStock(int threshold) {
        return inventoryRepository.findAllByQuantityAvailableLessThanEqual(threshold).stream()
                .map(this::toResponse).toList();
    }

    @Transactional
    public InventoryResponse upsert(Long productId, InventoryUpdateRequest req) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> Inventory.builder().product(product).build());

        inventory.setQuantityAvailable(req.quantityAvailable());
        if (req.reorderLevel() != null) inventory.setReorderLevel(req.reorderLevel());
        if (req.batchCode() != null) inventory.setBatchCode(req.batchCode());

        return toResponse(inventoryRepository.save(inventory));
    }

    private InventoryResponse toResponse(Inventory inv) {
        return new InventoryResponse(
                inv.getId(),
                inv.getProduct().getId(),
                inv.getProduct().getName(),
                inv.getVariant() != null ? inv.getVariant().getId() : null,
                inv.getVariant() != null ? inv.getVariant().getWeight() : null,
                inv.getQuantityAvailable(),
                inv.getReorderLevel(),
                inv.getBatchCode(),
                inv.getQuantityAvailable() <= inv.getReorderLevel()
        );
    }
}
