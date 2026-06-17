package com.appaamma.pickles.domain.inventory;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductId(Long productId);

    Optional<Inventory> findByVariantId(Long variantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Inventory i where i.product.id = :productId and i.variant is null")
    Optional<Inventory> lockByProductId(@Param("productId") Long productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Inventory i where i.variant.id = :variantId")
    Optional<Inventory> lockByVariantId(@Param("variantId") Long variantId);

    List<Inventory> findAllByQuantityAvailableLessThanEqual(Integer threshold);
}
