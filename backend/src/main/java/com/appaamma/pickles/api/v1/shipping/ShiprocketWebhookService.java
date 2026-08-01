package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.domain.order.Order;
import com.appaamma.pickles.domain.order.OrderRepository;
import com.appaamma.pickles.domain.order.OrderStatus;
import com.appaamma.pickles.domain.shipping.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShiprocketWebhookService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentEventRepository shipmentEventRepository;
    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void processWebhook(Map<String, Object> payload) {
        String awb = getString(payload, "awb");
        int statusId = getInt(payload, "current_status_id");
        String statusText = getString(payload, "current_status");

        Optional<Shipment> shipmentOpt = findShipment(payload);
        if (shipmentOpt.isEmpty()) {
            log.warn("No shipment found for webhook payload: awb={}, order_id={}",
                    awb, payload.get("order_id"));
            return;
        }

        Shipment shipment = shipmentOpt.get();

        // Create event record
        ShipmentEvent event = ShipmentEvent.builder()
                .shipment(shipment)
                .status(statusText)
                .statusCode(statusId)
                .description(getString(payload, "description"))
                .location(getString(payload, "current_city"))
                .eventTime(Instant.now())
                .shiprocketStatus(statusText)
                .rawPayload(payload.toString())
                .build();
        shipmentEventRepository.save(event);

        // Update shipment status
        ShipmentStatus newShipmentStatus = ShiprocketStatusMapper.toShipmentStatus(statusId);
        shipment.setStatus(newShipmentStatus);

        if (statusId == 7) { // Delivered
            shipment.setActualDeliveryDate(Instant.now());
        }

        shipmentRepository.save(shipment);

        // Update order status if applicable
        if (ShiprocketStatusMapper.shouldUpdateOrderStatus(statusId)) {
            OrderStatus newOrderStatus = ShiprocketStatusMapper.toOrderStatus(statusId);
            Order order = shipment.getOrder();

            if (order.getStatus().canTransitionTo(newOrderStatus)) {
                order.setStatus(newOrderStatus);

                if (newOrderStatus == OrderStatus.SHIPPED) {
                    order.setShippedAt(Instant.now());
                } else if (newOrderStatus == OrderStatus.DELIVERED) {
                    order.setDeliveredAt(Instant.now());
                }

                orderRepository.save(order);
                log.info("Order {} status updated to {} via webhook", order.getOrderNumber(), newOrderStatus);
            } else {
                log.warn("Cannot transition order {} from {} to {} — skipping",
                        order.getOrderNumber(), order.getStatus(), newOrderStatus);
            }
        }
    }

    private Optional<Shipment> findShipment(Map<String, Object> payload) {
        String awb = getString(payload, "awb");
        if (awb != null && !awb.isBlank()) {
            Optional<Shipment> byAwb = shipmentRepository.findByAwbNumber(awb);
            if (byAwb.isPresent()) return byAwb;
        }

        Object orderId = payload.get("order_id");
        if (orderId != null) {
            try {
                Long srOrderId = Long.parseLong(orderId.toString());
                return shipmentRepository.findByShiprocketOrderId(srOrderId);
            } catch (NumberFormatException ignored) {}
        }

        return Optional.empty();
    }

    private String getString(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val != null ? val.toString() : null;
    }

    private int getInt(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val instanceof Number n) return n.intValue();
        if (val != null) {
            try {
                return Integer.parseInt(val.toString());
            } catch (NumberFormatException e) {
                return 0;
            }
        }
        return 0;
    }
}
