package com.appaamma.pickles.api.v1.shipping.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record ShipmentResponse(
        Long id,
        Long orderId,
        String orderNumber,
        Long shiprocketOrderId,
        Long shiprocketShipmentId,
        String awbNumber,
        String courierName,
        Integer courierId,
        String status,
        LocalDate pickupScheduledDate,
        String labelUrl,
        String manifestUrl,
        String invoiceUrl,
        LocalDate estimatedDeliveryDate,
        Instant actualDeliveryDate,
        BigDecimal shippingCharge,
        BigDecimal weight,
        Instant createdAt,
        Instant updatedAt
) {}
