package com.appaamma.pickles.api.v1.order.dto;

import com.appaamma.pickles.domain.order.OrderChannel;
import com.appaamma.pickles.domain.order.OrderStatus;
import com.appaamma.pickles.domain.order.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        OrderStatus status,
        OrderChannel channel,
        PaymentMethod paymentMethod,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal total,
        String notes,
        Instant createdAt,
        CustomerInfo customer,
        ShippingAddressInfo shippingAddress,
        List<OrderItemResponse> items
) {

    public record CustomerInfo(Long id, String fullName, String email, String phone) {}

    public record ShippingAddressInfo(
            String line1, String line2, String city, String state, String pincode, String landmark
    ) {}

    public record OrderItemResponse(
            Long id,
            Long productId,
            Long variantId,
            String productName,
            String productWeight,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal lineTotal
    ) {}
}
