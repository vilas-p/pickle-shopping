package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.api.v1.shipping.dto.CreateShipmentRequest;
import com.appaamma.pickles.api.v1.shipping.dto.ShipmentResponse;
import com.appaamma.pickles.config.ShiprocketProperties;
import com.appaamma.pickles.domain.order.Order;
import com.appaamma.pickles.domain.order.OrderItem;
import com.appaamma.pickles.domain.order.OrderRepository;
import com.appaamma.pickles.domain.order.OrderStatus;
import com.appaamma.pickles.domain.shipping.Shipment;
import com.appaamma.pickles.domain.shipping.ShipmentRepository;
import com.appaamma.pickles.domain.shipping.ShipmentStatus;
import com.appaamma.pickles.exception.ShipmentCreationException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final ShiprocketApiClient apiClient;
    private final ShiprocketProperties properties;

    @Transactional
    public ShipmentResponse createShipment(CreateShipmentRequest request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + request.orderId()));

        if (order.getStatus() != OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.PACKED) {
            throw new ShipmentCreationException("Order must be CONFIRMED or PACKED to create shipment");
        }

        if (shipmentRepository.existsByOrderId(order.getId())) {
            throw new ShipmentCreationException("Shipment already exists for order: " + order.getOrderNumber());
        }

        Map<String, Object> orderData = buildShiprocketOrderPayload(order);
        Map<String, Object> response = apiClient.createOrder(orderData);

        Shipment shipment = Shipment.builder()
                .order(order)
                .shiprocketOrderId(toLong(response.get("order_id")))
                .shiprocketShipmentId(toLong(response.get("shipment_id")))
                .status(ShipmentStatus.CREATED)
                .weight(properties.defaultWeightKg())
                .length(properties.defaultLengthCm())
                .breadth(properties.defaultBreadthCm())
                .height(properties.defaultHeightCm())
                .build();

        shipment = shipmentRepository.save(shipment);
        log.info("Shipment created for order {} — SR Order ID: {}", order.getOrderNumber(), shipment.getShiprocketOrderId());

        if (properties.autoAssignAwb()) {
            assignAwbInternal(shipment, request.courierId());
        }

        return toResponse(shipment);
    }

    @Transactional
    public ShipmentResponse assignAwb(Long shipmentId) {
        Shipment shipment = findShipment(shipmentId);
        assignAwbInternal(shipment, null);
        return toResponse(shipment);
    }

    @Transactional
    public ShipmentResponse schedulePickup(Long shipmentId) {
        Shipment shipment = findShipment(shipmentId);

        Map<String, Object> pickupData = Map.of("shipment_id", List.of(shipment.getShiprocketShipmentId()));
        Map<String, Object> response = apiClient.schedulePickup(pickupData);

        if (response != null && response.containsKey("pickup_scheduled_date")) {
            shipment.setPickupScheduledDate(LocalDate.parse((String) response.get("pickup_scheduled_date")));
        }
        if (response != null && response.containsKey("pickup_token_number")) {
            shipment.setPickupToken(String.valueOf(response.get("pickup_token_number")));
        }
        shipment.setStatus(ShipmentStatus.PICKUP_SCHEDULED);
        shipmentRepository.save(shipment);

        log.info("Pickup scheduled for shipment {} on {}", shipmentId, shipment.getPickupScheduledDate());
        return toResponse(shipment);
    }

    @Transactional
    public ShipmentResponse cancelShipment(Long shipmentId, String reason) {
        Shipment shipment = findShipment(shipmentId);

        Map<String, Object> cancelData = Map.of("ids", List.of(shipment.getShiprocketOrderId()));
        apiClient.cancelOrder(cancelData);

        shipment.setStatus(ShipmentStatus.CANCELLED);
        shipment.setCancellationReason(reason);
        shipmentRepository.save(shipment);

        log.info("Shipment {} cancelled: {}", shipmentId, reason);
        return toResponse(shipment);
    }

    @Transactional
    public String getLabel(Long shipmentId) {
        Shipment shipment = findShipment(shipmentId);

        if (shipment.getLabelUrl() != null) {
            return shipment.getLabelUrl();
        }

        Map<String, Object> labelData = Map.of("shipment_id", List.of(shipment.getShiprocketShipmentId()));
        Map<String, Object> response = apiClient.generateLabel(labelData);
        String labelUrl = (String) response.get("label_url");

        shipment.setLabelUrl(labelUrl);
        shipmentRepository.save(shipment);
        return labelUrl;
    }

    public ShipmentResponse getById(Long shipmentId) {
        return toResponse(findShipment(shipmentId));
    }

    public ShipmentResponse getByOrderId(Long orderId) {
        Shipment shipment = shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new EntityNotFoundException("No shipment for order: " + orderId));
        return toResponse(shipment);
    }

    public Page<ShipmentResponse> list(Pageable pageable) {
        return shipmentRepository.findAll(pageable).map(this::toResponse);
    }

    // --- Private Helpers ---

    @SuppressWarnings("unchecked")
    private void assignAwbInternal(Shipment shipment, Integer preferredCourierId) {
        Map<String, Object> assignData = new HashMap<>();
        assignData.put("shipment_id", shipment.getShiprocketShipmentId());
        if (preferredCourierId != null) {
            assignData.put("courier_id", preferredCourierId);
        }

        Map<String, Object> response = apiClient.assignAwb(assignData);
        Map<String, Object> assignResponse = (Map<String, Object>) response.get("response");

        if (assignResponse != null) {
            Map<String, Object> data = (Map<String, Object>) assignResponse.get("data");
            if (data != null) {
                shipment.setAwbNumber(String.valueOf(data.get("awb_code")));
                shipment.setCourierName(String.valueOf(data.get("courier_name")));
                if (data.get("courier_company_id") instanceof Number n) {
                    shipment.setCourierId(n.intValue());
                }
            }
        }

        shipment.setStatus(ShipmentStatus.AWB_ASSIGNED);
        shipmentRepository.save(shipment);

        // Update order tracking number
        Order order = shipment.getOrder();
        order.setTrackingNumber(shipment.getAwbNumber());
        order.setCourierName(shipment.getCourierName());
        orderRepository.save(order);

        log.info("AWB assigned for shipment {}: {} ({})", shipment.getId(), shipment.getAwbNumber(), shipment.getCourierName());
    }

    private Map<String, Object> buildShiprocketOrderPayload(Order order) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("order_id", order.getOrderNumber());
        payload.put("order_date", order.getCreatedAt().toString().substring(0, 10));
        payload.put("pickup_location", properties.pickupLocationId());
        payload.put("billing_customer_name", order.getCustomer().getFullName());
        payload.put("billing_last_name", "");
        payload.put("billing_address", order.getShippingAddress().getLine1());
        payload.put("billing_city", order.getShippingAddress().getCity());
        payload.put("billing_pincode", order.getShippingAddress().getPincode());
        payload.put("billing_state", order.getShippingAddress().getState());
        payload.put("billing_country", "India");
        payload.put("billing_email", order.getCustomer().getEmail() != null ? order.getCustomer().getEmail() : "");
        payload.put("billing_phone", order.getCustomer().getPhone());
        payload.put("shipping_is_billing", true);
        payload.put("payment_method", "COD".equals(order.getPaymentMethod().name()) ? "COD" : "Prepaid");
        payload.put("sub_total", order.getSubtotal().doubleValue());

        List<Map<String, Object>> items = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            Map<String, Object> lineItem = new LinkedHashMap<>();
            lineItem.put("name", item.getProductName());
            lineItem.put("sku", "SKU-" + item.getProduct().getId());
            lineItem.put("units", item.getQuantity());
            lineItem.put("selling_price", item.getUnitPrice().doubleValue());
            items.add(lineItem);
        }
        payload.put("order_items", items);

        payload.put("weight", properties.defaultWeightKg().doubleValue());
        payload.put("length", properties.defaultLengthCm().intValue());
        payload.put("breadth", properties.defaultBreadthCm().intValue());
        payload.put("height", properties.defaultHeightCm().intValue());

        return payload;
    }

    private Shipment findShipment(Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found: " + id));
    }

    private ShipmentResponse toResponse(Shipment s) {
        return new ShipmentResponse(
                s.getId(),
                s.getOrder().getId(),
                s.getOrder().getOrderNumber(),
                s.getShiprocketOrderId(),
                s.getShiprocketShipmentId(),
                s.getAwbNumber(),
                s.getCourierName(),
                s.getCourierId(),
                s.getStatus().name(),
                s.getPickupScheduledDate(),
                s.getLabelUrl(),
                s.getManifestUrl(),
                s.getInvoiceUrl(),
                s.getEstimatedDeliveryDate(),
                s.getActualDeliveryDate(),
                s.getShippingCharge(),
                s.getWeight(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.longValue();
        return Long.parseLong(value.toString());
    }
}
