package com.appaamma.pickles.api.v1.admin.dto;

import java.math.BigDecimal;
import java.util.Map;

public record DashboardStatsResponse(
        long totalProducts,
        long totalCustomers,
        long totalOrders,
        long pendingOrders,
        long ordersLast30Days,
        BigDecimal revenueLast30Days,
        long lowStockItems,
        long unhandledContacts,
        long pendingReviews,
        Map<String, Long> ordersByStatus
) {}
