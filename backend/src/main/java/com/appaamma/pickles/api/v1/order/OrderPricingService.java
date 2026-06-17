package com.appaamma.pickles.api.v1.order;

import com.appaamma.pickles.domain.order.OrderItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Centralises all order pricing rules — line subtotals, shipping, totals. Lives here so the
 * rules can be changed (e.g. promotional codes, tax) without touching {@link OrderService}.
 */
@Component
public class OrderPricingService {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("999");
    private static final BigDecimal FLAT_SHIPPING_FEE = new BigDecimal("60.00");

    public PricedOrder price(List<OrderItem> items) {
        BigDecimal subtotal = items.stream()
                .map(OrderItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal shipping = calculateShipping(subtotal);
        BigDecimal total = subtotal.add(shipping);
        return new PricedOrder(subtotal, shipping, total);
    }

    private BigDecimal calculateShipping(BigDecimal subtotal) {
        return subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
                ? BigDecimal.ZERO
                : FLAT_SHIPPING_FEE;
    }

    public record PricedOrder(BigDecimal subtotal, BigDecimal shippingFee, BigDecimal total) {}
}
