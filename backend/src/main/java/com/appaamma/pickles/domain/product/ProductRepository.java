package com.appaamma.pickles.domain.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @EntityGraph(attributePaths = {"category", "images", "variants"})
    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @EntityGraph(attributePaths = {"category", "images", "variants"})
    @Query("select p from Product p where p.active = true and p.featured = true")
    List<Product> findFeatured();

    @EntityGraph(attributePaths = {"category", "images", "variants"})
    Page<Product> findAllByActiveTrue(Pageable pageable);
}
