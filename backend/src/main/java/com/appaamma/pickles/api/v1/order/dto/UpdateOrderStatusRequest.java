package com.appaamma.pickles.api.v1.order.dto;

import com.appaamma.pickles.domain.order.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull OrderStatus status
) {}
