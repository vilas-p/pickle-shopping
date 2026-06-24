package com.appaamma.pickles.api.v1.delivery;

import com.appaamma.pickles.api.v1.delivery.dto.DeliveryEstimateRequest;
import com.appaamma.pickles.api.v1.delivery.dto.DeliveryEstimateResponse;
import com.appaamma.pickles.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Delivery", description = "Delivery estimates for checkout")
@RestController
@RequestMapping("/api/v1/delivery")
@RequiredArgsConstructor
public class DeliveryEstimateController {

    private final DeliveryEstimateService deliveryEstimateService;

    @Operation(summary = "Estimate distance and transit time from store to shipping address")
    @PostMapping("/estimate")
    public ApiResponse<DeliveryEstimateResponse> estimate(@Valid @RequestBody DeliveryEstimateRequest request) {
        return ApiResponse.ok(deliveryEstimateService.estimate(request));
    }
}