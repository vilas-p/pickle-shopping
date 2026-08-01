package com.appaamma.pickles.api.v1.shipping.dto;

import java.time.Instant;
import java.util.List;

public record TrackingResponse(
        String orderNumber,
        String awbNumber,
        String courierName,
        String currentStatus,
        String estimatedDelivery,
        String trackingUrl,
        List<TrackingEvent> events
) {
    public record TrackingEvent(
            String status,
            String description,
            String location,
            Instant timestamp
    ) {}
}
