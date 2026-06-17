package com.appaamma.pickles.api.v1.order;

import com.appaamma.pickles.api.v1.order.dto.CreateOrderRequest;
import com.appaamma.pickles.api.v1.order.dto.OrderResponse;
import com.appaamma.pickles.api.v1.order.dto.UpdateOrderStatusRequest;
import com.appaamma.pickles.common.ApiResponse;
import com.appaamma.pickles.common.PageResponse;
import com.appaamma.pickles.domain.order.OrderStatus;
import com.appaamma.pickles.security.CustomerPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Orders", description = "Order placement and management")
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Place a new order from the storefront")
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> place(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse order = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(order, "Order placed successfully"));
    }

    @Operation(summary = "Get order by order number (public — for receipt page)")
    @GetMapping("/number/{orderNumber}")
    public ApiResponse<OrderResponse> byNumber(@PathVariable String orderNumber) {
        return ApiResponse.ok(orderService.getByOrderNumber(orderNumber));
    }

    @Operation(summary = "[Admin] List orders, optionally filtered by status")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ApiResponse<PageResponse<OrderResponse>> list(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        return ApiResponse.ok(orderService.list(status, pageable));
    }

    @Operation(summary = "[Admin] Get order by id")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ApiResponse<OrderResponse> byId(@PathVariable Long id) {
        return ApiResponse.ok(orderService.getById(id));
    }

    @Operation(summary = "[Admin] Update order status")
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ApiResponse<OrderResponse> updateStatus(@PathVariable Long id,
                                                    @Valid @RequestBody UpdateOrderStatusRequest req) {
        return ApiResponse.ok(orderService.updateStatus(id, req.status()), "Status updated");
    }

    @Operation(summary = "[Customer] List my orders")
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<PageResponse<OrderResponse>> myOrders(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {
        return ApiResponse.ok(orderService.listByCustomer(principal.customerId(), pageable));
    }

    @Operation(summary = "[Customer] Get one of my orders by order number")
    @GetMapping("/my/{orderNumber}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<OrderResponse> myOrderByNumber(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @PathVariable String orderNumber
    ) {
        return ApiResponse.ok(orderService.getByOrderNumberForCustomer(orderNumber, principal.customerId()));
    }
}
