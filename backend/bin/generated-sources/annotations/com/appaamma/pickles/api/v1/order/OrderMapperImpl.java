package com.appaamma.pickles.api.v1.order;

import com.appaamma.pickles.api.v1.order.dto.OrderResponse;
import com.appaamma.pickles.domain.customer.Address;
import com.appaamma.pickles.domain.customer.Customer;
import com.appaamma.pickles.domain.order.Order;
import com.appaamma.pickles.domain.order.OrderChannel;
import com.appaamma.pickles.domain.order.OrderItem;
import com.appaamma.pickles.domain.order.OrderStatus;
import com.appaamma.pickles.domain.order.PaymentMethod;
import com.appaamma.pickles.domain.product.Product;
import com.appaamma.pickles.domain.product.ProductVariant;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-16T22:53:56+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class OrderMapperImpl implements OrderMapper {

    @Override
    public OrderResponse toResponse(Order order) {
        if ( order == null ) {
            return null;
        }

        OrderResponse.CustomerInfo customer = null;
        OrderResponse.ShippingAddressInfo shippingAddress = null;
        Long id = null;
        String orderNumber = null;
        OrderStatus status = null;
        OrderChannel channel = null;
        PaymentMethod paymentMethod = null;
        BigDecimal subtotal = null;
        BigDecimal shippingFee = null;
        BigDecimal total = null;
        String notes = null;
        Instant createdAt = null;
        List<OrderResponse.OrderItemResponse> items = null;

        customer = toCustomerInfo( order.getCustomer() );
        shippingAddress = toAddressInfo( order.getShippingAddress() );
        id = order.getId();
        orderNumber = order.getOrderNumber();
        status = order.getStatus();
        channel = order.getChannel();
        paymentMethod = order.getPaymentMethod();
        subtotal = order.getSubtotal();
        shippingFee = order.getShippingFee();
        total = order.getTotal();
        notes = order.getNotes();
        createdAt = order.getCreatedAt();
        items = orderItemListToOrderItemResponseList( order.getItems() );

        OrderResponse orderResponse = new OrderResponse( id, orderNumber, status, channel, paymentMethod, subtotal, shippingFee, total, notes, createdAt, customer, shippingAddress, items );

        return orderResponse;
    }

    @Override
    public List<OrderResponse> toResponseList(List<Order> orders) {
        if ( orders == null ) {
            return null;
        }

        List<OrderResponse> list = new ArrayList<OrderResponse>( orders.size() );
        for ( Order order : orders ) {
            list.add( toResponse( order ) );
        }

        return list;
    }

    @Override
    public OrderResponse.CustomerInfo toCustomerInfo(Customer customer) {
        if ( customer == null ) {
            return null;
        }

        Long id = null;
        String fullName = null;
        String email = null;
        String phone = null;

        id = customer.getId();
        fullName = customer.getFullName();
        email = customer.getEmail();
        phone = customer.getPhone();

        OrderResponse.CustomerInfo customerInfo = new OrderResponse.CustomerInfo( id, fullName, email, phone );

        return customerInfo;
    }

    @Override
    public OrderResponse.ShippingAddressInfo toAddressInfo(Address address) {
        if ( address == null ) {
            return null;
        }

        String line1 = null;
        String line2 = null;
        String city = null;
        String state = null;
        String pincode = null;
        String landmark = null;

        line1 = address.getLine1();
        line2 = address.getLine2();
        city = address.getCity();
        state = address.getState();
        pincode = address.getPincode();
        landmark = address.getLandmark();

        OrderResponse.ShippingAddressInfo shippingAddressInfo = new OrderResponse.ShippingAddressInfo( line1, line2, city, state, pincode, landmark );

        return shippingAddressInfo;
    }

    @Override
    public OrderResponse.OrderItemResponse toItemResponse(OrderItem item) {
        if ( item == null ) {
            return null;
        }

        Long productId = null;
        Long variantId = null;
        Long id = null;
        String productName = null;
        String productWeight = null;
        Integer quantity = null;
        BigDecimal unitPrice = null;
        BigDecimal lineTotal = null;

        productId = itemProductId( item );
        variantId = itemVariantId( item );
        id = item.getId();
        productName = item.getProductName();
        productWeight = item.getProductWeight();
        quantity = item.getQuantity();
        unitPrice = item.getUnitPrice();
        lineTotal = item.getLineTotal();

        OrderResponse.OrderItemResponse orderItemResponse = new OrderResponse.OrderItemResponse( id, productId, variantId, productName, productWeight, quantity, unitPrice, lineTotal );

        return orderItemResponse;
    }

    protected List<OrderResponse.OrderItemResponse> orderItemListToOrderItemResponseList(List<OrderItem> list) {
        if ( list == null ) {
            return null;
        }

        List<OrderResponse.OrderItemResponse> list1 = new ArrayList<OrderResponse.OrderItemResponse>( list.size() );
        for ( OrderItem orderItem : list ) {
            list1.add( toItemResponse( orderItem ) );
        }

        return list1;
    }

    private Long itemProductId(OrderItem orderItem) {
        Product product = orderItem.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getId();
    }

    private Long itemVariantId(OrderItem orderItem) {
        ProductVariant variant = orderItem.getVariant();
        if ( variant == null ) {
            return null;
        }
        return variant.getId();
    }
}
