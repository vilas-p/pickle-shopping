package com.appaamma.pickles.api.v1.order;

import com.appaamma.pickles.api.v1.order.dto.OrderResponse;
import com.appaamma.pickles.domain.customer.Address;
import com.appaamma.pickles.domain.customer.Customer;
import com.appaamma.pickles.domain.order.Order;
import com.appaamma.pickles.domain.order.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper
public interface OrderMapper {

    @Mapping(target = "customer", source = "customer")
    @Mapping(target = "shippingAddress", source = "shippingAddress")
    OrderResponse toResponse(Order order);

    List<OrderResponse> toResponseList(List<Order> orders);

    OrderResponse.CustomerInfo toCustomerInfo(Customer customer);

    OrderResponse.ShippingAddressInfo toAddressInfo(Address address);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "variantId", source = "variant.id")
    OrderResponse.OrderItemResponse toItemResponse(OrderItem item);
}
