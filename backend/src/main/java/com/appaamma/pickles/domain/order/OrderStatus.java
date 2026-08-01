package com.appaamma.pickles.domain.order;

import java.util.Map;
import java.util.Set;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PACKED,
    SHIPPED,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED,
    RTO_INITIATED,
    RTO_DELIVERED;

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_NEXT = Map.of(
            PENDING,            Set.of(CONFIRMED, CANCELLED),
            CONFIRMED,          Set.of(PACKED, CANCELLED),
            PACKED,             Set.of(SHIPPED, CANCELLED),
            SHIPPED,            Set.of(OUT_FOR_DELIVERY, DELIVERED, RTO_INITIATED),
            OUT_FOR_DELIVERY,   Set.of(DELIVERED, RTO_INITIATED),
            DELIVERED,          Set.of(),
            CANCELLED,          Set.of(),
            RTO_INITIATED,      Set.of(RTO_DELIVERED),
            RTO_DELIVERED,      Set.of()
    );

    public boolean canTransitionTo(OrderStatus next) {
        return ALLOWED_NEXT.getOrDefault(this, Set.of()).contains(next);
    }

    public boolean isTerminal() {
        return ALLOWED_NEXT.getOrDefault(this, Set.of()).isEmpty();
    }
}
