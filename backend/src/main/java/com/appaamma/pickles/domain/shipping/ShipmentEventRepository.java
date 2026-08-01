package com.appaamma.pickles.domain.shipping;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShipmentEventRepository extends JpaRepository<ShipmentEvent, Long> {

    List<ShipmentEvent> findByShipmentIdOrderByEventTimeAsc(Long shipmentId);
}
