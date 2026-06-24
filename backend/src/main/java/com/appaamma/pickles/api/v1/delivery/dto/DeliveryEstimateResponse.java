package com.appaamma.pickles.api.v1.delivery.dto;

public record DeliveryEstimateResponse(
        LocationSummary store,
        LocationSummary destination,
        int estimatedDistanceKm,
        int estimatedTransitDaysMin,
        int estimatedTransitDaysMax,
        String estimatedDeliveryWindow,
        String serviceLevel
) {
    public record LocationSummary(
            String label,
            String line1,
            String city,
            String state,
            String pincode
    ) {
    }
}