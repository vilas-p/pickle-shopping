package com.appaamma.pickles.domain.inventory;

import com.appaamma.pickles.common.BaseEntity;
import com.appaamma.pickles.domain.product.Product;
import com.appaamma.pickles.domain.product.ProductVariant;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantityAvailable = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer reorderLevel = 10;

    @Column(length = 100)
    private String batchCode;
}
