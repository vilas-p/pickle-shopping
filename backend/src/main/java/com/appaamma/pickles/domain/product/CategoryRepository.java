package com.appaamma.pickles.domain.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    List<Category> findAllByActiveTrueOrderByNameAsc();
    boolean existsBySlug(String slug);
}
