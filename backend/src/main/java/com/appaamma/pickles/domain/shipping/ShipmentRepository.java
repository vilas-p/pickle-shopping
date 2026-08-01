package com.appaamma.pickles.domain.shipping;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByOrderId(Long orderId);

    Optional<Shipment> findByAwbNumber(String awbNumber);

    Optional<Shipment> findByShiprocketOrderId(Long shiprocketOrderId);

    Page<Shipment> findByStatus(ShipmentStatus status, Pageable pageable);

    boolean existsByOrderId(Long orderId);
}
