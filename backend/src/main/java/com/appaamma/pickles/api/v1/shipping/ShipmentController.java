package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.api.v1.shipping.dto.CreateShipmentRequest;
import com.appaamma.pickles.api.v1.shipping.dto.ShipmentResponse;
import com.appaamma.pickles.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/shipments")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ShipmentResponse> create(@Valid @RequestBody CreateShipmentRequest request) {
        return ApiResponse.ok(shipmentService.createShipment(request));
    }

    @GetMapping
    public ApiResponse<Page<ShipmentResponse>> list(Pageable pageable) {
        return ApiResponse.ok(shipmentService.list(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ShipmentResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(shipmentService.getById(id));
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<ShipmentResponse> getByOrderId(@PathVariable Long orderId) {
        return ApiResponse.ok(shipmentService.getByOrderId(orderId));
    }

    @PostMapping("/{id}/assign-awb")
    public ApiResponse<ShipmentResponse> assignAwb(@PathVariable Long id) {
        return ApiResponse.ok(shipmentService.assignAwb(id));
    }

    @PostMapping("/{id}/pickup")
    public ApiResponse<ShipmentResponse> schedulePickup(@PathVariable Long id) {
        return ApiResponse.ok(shipmentService.schedulePickup(id));
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<ShipmentResponse> cancel(@PathVariable Long id, @RequestParam String reason) {
        return ApiResponse.ok(shipmentService.cancelShipment(id, reason));
    }

    @GetMapping("/{id}/label")
    public ApiResponse<String> getLabel(@PathVariable Long id) {
        return ApiResponse.ok(shipmentService.getLabel(id));
    }
}
