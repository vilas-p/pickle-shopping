package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.api.v1.shipping.dto.ServiceabilityRequest;
import com.appaamma.pickles.api.v1.shipping.dto.ServiceabilityResponse;
import com.appaamma.pickles.config.ShiprocketProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceabilityService {

    private final ShiprocketApiClient apiClient;
    private final ShiprocketProperties properties;

    @SuppressWarnings("unchecked")
    public ServiceabilityResponse check(ServiceabilityRequest request) {
        Map<String, Object> response = apiClient.checkServiceability(
                properties.pickupPincode(),
                request.deliveryPincode(),
                request.weight(),
                request.cod()
        );

        List<ServiceabilityResponse.CourierOption> couriers = new ArrayList<>();

        if (response != null) {
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            if (data != null) {
                List<Map<String, Object>> courierList = (List<Map<String, Object>>) data.get("available_courier_companies");
                if (courierList != null) {
                    for (Map<String, Object> c : courierList) {
                        couriers.add(new ServiceabilityResponse.CourierOption(
                                ((Number) c.get("courier_company_id")).intValue(),
                                (String) c.get("courier_name"),
                                ((Number) c.get("rate")).doubleValue(),
                                ((Number) c.get("estimated_delivery_days")).intValue(),
                                Boolean.TRUE.equals(c.get("cod"))
                        ));
                    }
                }
            }
        }

        return new ServiceabilityResponse(!couriers.isEmpty(), couriers);
    }
}
