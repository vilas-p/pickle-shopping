package com.appaamma.pickles.api.v1.shipping.dto;

import java.util.List;

public record ServiceabilityResponse(
        boolean serviceable,
        List<CourierOption> availableCouriers
) {
    public record CourierOption(
            int courierId,
            String courierName,
            double rate,
            int estimatedDays,
            boolean cod
    ) {}
}
