package com.appaamma.pickles.api.v1.order.dto;

import com.appaamma.pickles.domain.order.OrderChannel;
import com.appaamma.pickles.domain.order.OrderStatus;
import com.appaamma.pickles.domain.order.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record PublicOrderResponse(
        String orderNumber,
        OrderStatus status,
        OrderChannel channel,
        PaymentMethod paymentMethod,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal total,
        Instant createdAt,
        List<OrderResponse.OrderItemResponse> items
) {}