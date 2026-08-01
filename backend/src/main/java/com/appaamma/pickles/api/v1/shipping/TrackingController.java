package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.api.v1.shipping.dto.TrackingResponse;
import com.appaamma.pickles.common.ApiResponse;
import com.appaamma.pickles.domain.order.Order;
import com.appaamma.pickles.domain.order.OrderRepository;
import com.appaamma.pickles.domain.shipping.Shipment;
import com.appaamma.pickles.domain.shipping.ShipmentEvent;
import com.appaamma.pickles.domain.shipping.ShipmentEventRepository;
import com.appaamma.pickles.domain.shipping.ShipmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;
    private final ShipmentEventRepository shipmentEventRepository;

    @GetMapping("/{orderNumber}")
    public ApiResponse<TrackingResponse> track(@PathVariable String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderNumber));

        Shipment shipment = shipmentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new EntityNotFoundException("No shipment for order: " + orderNumber));

        List<ShipmentEvent> events = shipmentEventRepository
                .findByShipmentIdOrderByEventTimeAsc(shipment.getId());

        List<TrackingResponse.TrackingEvent> trackingEvents = events.stream()
                .map(e -> new TrackingResponse.TrackingEvent(
                        e.getStatus(),
                        e.getDescription(),
                        e.getLocation(),
                        e.getEventTime()
                ))
                .toList();

        return ApiResponse.ok(new TrackingResponse(
                order.getOrderNumber(),
                shipment.getAwbNumber(),
                shipment.getCourierName(),
                shipment.getStatus().name(),
                shipment.getEstimatedDeliveryDate() != null ? shipment.getEstimatedDeliveryDate().toString() : null,
                null,
                trackingEvents
        ));
    }
}
