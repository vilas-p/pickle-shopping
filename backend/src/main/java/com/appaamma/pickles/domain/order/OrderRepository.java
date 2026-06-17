package com.appaamma.pickles.domain.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"customer", "shippingAddress", "items", "items.product"})
    Optional<Order> findByOrderNumber(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);

    @EntityGraph(attributePaths = {"customer"})
    Page<Order> findAllByStatus(OrderStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"customer"})
    Page<Order> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "shippingAddress", "items", "items.product"})
    Page<Order> findAllByCustomerId(Long customerId, Pageable pageable);

    long countByStatus(OrderStatus status);
    long countByCreatedAtAfter(Instant after);
}
