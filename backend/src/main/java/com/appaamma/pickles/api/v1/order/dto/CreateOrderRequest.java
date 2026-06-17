package com.appaamma.pickles.api.v1.order.dto;

import com.appaamma.pickles.domain.order.OrderChannel;
import com.appaamma.pickles.domain.order.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record CreateOrderRequest(
        @Valid @NotNull CustomerInfo customer,
        @Valid @NotNull ShippingAddressInfo shippingAddress,
        @NotEmpty @Valid List<OrderItemRequest> items,
        OrderChannel channel,
        PaymentMethod paymentMethod,
        @Size(max = 1000) String notes
) {

    public record CustomerInfo(
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @Email @Size(max = 150) String email,
            @NotBlank @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone must be 10–15 digits, optionally with leading +")
            String phone
    ) {}

    public record ShippingAddressInfo(
            @NotBlank @Size(max = 200) String line1,
            @Size(max = 200) String line2,
            @NotBlank @Size(max = 100) String city,
            @NotBlank @Size(max = 100) String state,
            @NotBlank @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Pincode must be 6 digits") String pincode,
            @Size(max = 500) String landmark
    ) {}

    public record OrderItemRequest(
            @NotNull Long productId,
            Long variantId,
            @NotNull @Min(1) @Max(50) Integer quantity
    ) {}
}
