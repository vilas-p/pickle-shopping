package com.appaamma.pickles.domain.review;

import com.appaamma.pickles.common.BaseEntity;
import com.appaamma.pickles.domain.product.Product;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reviews", indexes = {
        @Index(name = "idx_reviews_product_approved", columnList = "product_id, approved")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product; // null = site-wide review

    @Column(nullable = false, length = 100)
    private String authorName;

    @Column(length = 100)
    private String authorCity;

    @Column(nullable = false)
    private Integer rating; // 1..5

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false)
    @Builder.Default
    private boolean approved = false;
}
