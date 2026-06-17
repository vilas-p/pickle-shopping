package com.appaamma.pickles.api.v1.admin;

import com.appaamma.pickles.api.v1.admin.dto.DashboardStatsResponse;
import com.appaamma.pickles.common.ApiResponse;
import com.appaamma.pickles.domain.contact.ContactRepository;
import com.appaamma.pickles.domain.customer.CustomerRepository;
import com.appaamma.pickles.domain.inventory.InventoryRepository;
import com.appaamma.pickles.domain.order.Order;
import com.appaamma.pickles.domain.order.OrderRepository;
import com.appaamma.pickles.domain.order.OrderStatus;
import com.appaamma.pickles.domain.product.ProductRepository;
import com.appaamma.pickles.domain.review.ReviewRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

@Tag(name = "Admin Dashboard", description = "[Admin] aggregated metrics")
@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
public class DashboardController {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final ContactRepository contactRepository;
    private final ReviewRepository reviewRepository;

    @Operation(summary = "Aggregate dashboard statistics")
    @GetMapping("/stats")
    @Transactional(readOnly = true)
    public ApiResponse<DashboardStatsResponse> stats() {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);

        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus s : OrderStatus.values()) {
            ordersByStatus.put(s.name(), orderRepository.countByStatus(s));
        }

        BigDecimal revenueLast30 = orderRepository.findAll(PageRequest.of(0, 1000))
                .stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(thirtyDaysAgo))
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        DashboardStatsResponse response = new DashboardStatsResponse(
                productRepository.count(),
                customerRepository.count(),
                orderRepository.count(),
                orderRepository.countByStatus(OrderStatus.PENDING),
                orderRepository.countByCreatedAtAfter(thirtyDaysAgo),
                revenueLast30,
                inventoryRepository.findAllByQuantityAvailableLessThanEqual(10).size(),
                contactRepository.findAllByHandled(false, PageRequest.of(0, 1)).getTotalElements(),
                reviewRepository.findAllByApproved(false, PageRequest.of(0, 1)).getTotalElements(),
                ordersByStatus
        );
        return ApiResponse.ok(response);
    }
}
