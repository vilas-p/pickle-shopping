package com.appaamma.pickles.domain.order;

import java.util.Map;
import java.util.Set;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PACKED,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_NEXT = Map.of(
            PENDING,   Set.of(CONFIRMED, CANCELLED),
            CONFIRMED, Set.of(PACKED, CANCELLED),
            PACKED,    Set.of(SHIPPED, CANCELLED),
            SHIPPED,   Set.of(DELIVERED),
            DELIVERED, Set.of(),
            CANCELLED, Set.of()
    );

    public boolean canTransitionTo(OrderStatus next) {
        return ALLOWED_NEXT.getOrDefault(this, Set.of()).contains(next);
    }

    public boolean isTerminal() {
        return ALLOWED_NEXT.getOrDefault(this, Set.of()).isEmpty();
    }
}
