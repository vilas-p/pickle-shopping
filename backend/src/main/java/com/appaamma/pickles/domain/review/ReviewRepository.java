package com.appaamma.pickles.domain.review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findAllByApprovedTrueOrderByCreatedAtDesc(Pageable pageable);
    List<Review> findTop6ByApprovedTrueOrderByCreatedAtDesc();
    Page<Review> findAllByProductIdAndApprovedTrue(Long productId, Pageable pageable);
    Page<Review> findAllByApproved(boolean approved, Pageable pageable);
}
