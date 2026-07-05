package com.appaamma.pickles.domain.inventory;

import com.appaamma.pickles.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class InventoryReservationService {

    private final InventoryRepository inventoryRepository;

    /**
     * Reserves stock for a product without a variant (legacy / non-variant products).
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void reserve(Long productId, String productNameForError, int quantity) {
        inventoryRepository.lockByProductId(productId).ifPresent(inv ->
                deduct(inv, productNameForError, quantity));
    }

    /**
     * Reserves stock for a specific product variant.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void reserveVariant(Long variantId, String productNameForError, int quantity) {
        inventoryRepository.lockByVariantId(variantId).ifPresent(inv ->
                deduct(inv, productNameForError, quantity));
    }

    /**
     * Releases stock for a product without a variant.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void release(Long productId, int quantity) {
        inventoryRepository.lockByProductId(productId).ifPresent(inv ->
                inv.setQuantityAvailable(inv.getQuantityAvailable() + quantity));
    }

    /**
     * Releases stock for a specific product variant.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void releaseVariant(Long variantId, int quantity) {
        inventoryRepository.lockByVariantId(variantId).ifPresent(inv ->
                inv.setQuantityAvailable(inv.getQuantityAvailable() + quantity));
    }

    private void deduct(Inventory inv, String nameForError, int quantity) {
        if (inv.getQuantityAvailable() < quantity) {
            throw new BadRequestException("Insufficient stock for: " + nameForError);
        }
        inv.setQuantityAvailable(inv.getQuantityAvailable() - quantity);
    }
}
