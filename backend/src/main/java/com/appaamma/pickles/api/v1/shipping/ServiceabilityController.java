package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.api.v1.shipping.dto.ServiceabilityRequest;
import com.appaamma.pickles.api.v1.shipping.dto.ServiceabilityResponse;
import com.appaamma.pickles.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/shipping")
@RequiredArgsConstructor
public class ServiceabilityController {

    private final ServiceabilityService serviceabilityService;

    @PostMapping("/serviceability")
    public ApiResponse<ServiceabilityResponse> checkServiceability(
            @Valid @RequestBody ServiceabilityRequest request) {
        return ApiResponse.ok(serviceabilityService.check(request));
    }
}
