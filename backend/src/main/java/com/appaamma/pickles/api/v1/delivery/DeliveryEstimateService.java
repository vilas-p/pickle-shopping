package com.appaamma.pickles.api.v1.delivery;

import com.appaamma.pickles.api.v1.delivery.dto.DeliveryEstimateRequest;
import com.appaamma.pickles.api.v1.delivery.dto.DeliveryEstimateResponse;
import com.appaamma.pickles.config.StoreLocationProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeliveryEstimateService {

    private final StoreLocationProperties storeLocationProperties;

    public DeliveryEstimateResponse estimate(DeliveryEstimateRequest request) {
        String storeCity = normalise(storeLocationProperties.city());
        String storeState = normalise(storeLocationProperties.state());
        String destinationCity = normalise(request.city());
        String destinationState = normalise(request.state());
        String storePincode = digitsOnly(storeLocationProperties.pincode());
        String destinationPincode = digitsOnly(request.pincode());

        boolean samePincode = storePincode.equals(destinationPincode);
        boolean sameCity = storeCity.equals(destinationCity) && storeState.equals(destinationState);
        boolean sameState = storeState.equals(destinationState);
        boolean samePrefix3 = prefix(storePincode, 3).equals(prefix(destinationPincode, 3));
        boolean sameZone = prefix(storePincode, 1).equals(prefix(destinationPincode, 1));

        int estimatedDistanceKm = estimateDistanceKm(
                storePincode,
                destinationPincode,
                samePincode,
                sameCity,
                sameState,
                samePrefix3,
                sameZone
        );

        TransitWindow transitWindow = estimateTransitWindow(estimatedDistanceKm, sameCity);

        return new DeliveryEstimateResponse(
                new DeliveryEstimateResponse.LocationSummary(
                        storeLocationProperties.label(),
                        storeLocationProperties.line1(),
                        storeLocationProperties.city(),
                        storeLocationProperties.state(),
                        storeLocationProperties.pincode()
                ),
                new DeliveryEstimateResponse.LocationSummary(
                        "Customer shipping address",
                        null,
                        request.city().trim(),
                        request.state().trim(),
                        request.pincode().trim()
                ),
                estimatedDistanceKm,
                transitWindow.minDays(),
                transitWindow.maxDays(),
                transitWindow.label(),
                transitWindow.serviceLevel()
        );
    }

    private int estimateDistanceKm(
            String storePincode,
            String destinationPincode,
            boolean samePincode,
            boolean sameCity,
            boolean sameState,
            boolean samePrefix3,
            boolean sameZone
    ) {
        int prefixGap = Math.abs(parseInt(prefix(storePincode, 3)) - parseInt(prefix(destinationPincode, 3)));
        int suffixGap = Math.abs(parseInt(storePincode.substring(3)) - parseInt(destinationPincode.substring(3)));

        if (samePincode) {
            return 8;
        }
        if (sameCity) {
            return 18 + Math.min(24, suffixGap / 30);
        }
        if (sameState && samePrefix3) {
            return 55 + Math.min(80, suffixGap / 10);
        }
        if (sameState) {
            return 140 + Math.min(260, prefixGap);
        }
        if (sameZone) {
            return 320 + Math.min(420, prefixGap);
        }
        return 780 + Math.min(1220, prefixGap * 2);
    }

    private TransitWindow estimateTransitWindow(int distanceKm, boolean sameCity) {
        if (sameCity || distanceKm <= 20) {
            return new TransitWindow(0, 1, "Same day or next day", "Local dispatch");
        }
        if (distanceKm <= 120) {
            return new TransitWindow(1, 2, "1-2 business days", "Nearby district");
        }
        if (distanceKm <= 320) {
            return new TransitWindow(2, 4, "2-4 business days", "Within state");
        }
        if (distanceKm <= 800) {
            return new TransitWindow(3, 5, "3-5 business days", "Regional shipping");
        }
        if (distanceKm <= 1400) {
            return new TransitWindow(4, 7, "4-7 business days", "Interstate shipping");
        }
        return new TransitWindow(5, 8, "5-8 business days", "Long-distance shipping");
    }

    private String normalise(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private String digitsOnly(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    private String prefix(String value, int length) {
        if (value == null || value.length() < length) {
            return "";
        }
        return value.substring(0, length);
    }

    private int parseInt(String value) {
        if (value == null || value.isBlank()) {
            return 0;
        }
        return Integer.parseInt(value);
    }

    private record TransitWindow(int minDays, int maxDays, String label, String serviceLevel) {
    }
}