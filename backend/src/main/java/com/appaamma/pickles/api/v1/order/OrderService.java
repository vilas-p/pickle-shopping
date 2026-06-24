package com.appaamma.pickles.api.v1.order;

import com.appaamma.pickles.api.v1.order.OrderPricingService.PricedOrder;
import com.appaamma.pickles.api.v1.order.dto.CreateOrderRequest;
import com.appaamma.pickles.api.v1.order.dto.OrderResponse;
import com.appaamma.pickles.common.PageResponse;
import com.appaamma.pickles.domain.customer.Address;
import com.appaamma.pickles.domain.customer.AddressRepository;
import com.appaamma.pickles.domain.customer.Customer;
import com.appaamma.pickles.domain.customer.CustomerRepository;
import com.appaamma.pickles.domain.inventory.InventoryReservationService;
import com.appaamma.pickles.domain.order.*;
import com.appaamma.pickles.domain.product.Product;
import com.appaamma.pickles.domain.product.ProductRepository;
import com.appaamma.pickles.domain.product.ProductVariant;
import com.appaamma.pickles.domain.product.ProductVariantRepository;
import com.appaamma.pickles.exception.BadRequestException;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import com.appaamma.pickles.security.CustomerPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryReservationService inventoryReservationService;
    private final OrderPricingService pricingService;
    private final OrderNumberGenerator orderNumberGenerator;
    private final OrderMapper orderMapper;
    private final AddressRepository addressRepository;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest req, CustomerPrincipal principal) {
        if (req.items() == null || req.items().isEmpty()) {
            throw new BadRequestException("Order must contain at least one item");
        }

        Customer customer = findOrCreateCustomer(req.customer(), principal);
        syncCustomerProfile(customer, req.customer(), principal);
        Address address = resolveShippingAddress(customer, req.shippingAddress());


        Order order = Order.builder()
                .orderNumber(orderNumberGenerator.next())
                .customer(customer)
                .shippingAddress(address)
                .status(OrderStatus.PENDING)
                .channel(req.channel() != null ? req.channel() : OrderChannel.WEBSITE)
                .paymentMethod(req.paymentMethod() != null ? req.paymentMethod() : PaymentMethod.COD)
                .notes(req.notes())
                .subtotal(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .build();

        for (var line : req.items()) {
            Product product = productRepository.findById(line.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", line.productId()));
            if (!product.isActive()) {
                throw new BadRequestException("Product not available: " + product.getName());
            }

            // Resolve variant (optional). If supplied, use variant's price/weight; otherwise fall back to product-level.
            ProductVariant variant = null;
            BigDecimal unitPrice;
            String weight;

            if (line.variantId() != null) {
                variant = variantRepository.findById(line.variantId())
                        .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", line.variantId()));
                if (!variant.getProduct().getId().equals(product.getId())) {
                    throw new BadRequestException("Variant does not belong to product: " + product.getName());
                }
                if (!variant.isActive()) {
                    throw new BadRequestException("Variant not available: " + product.getName() + " " + variant.getWeight());
                }
                inventoryReservationService.reserveVariant(variant.getId(), product.getName() + " " + variant.getWeight(), line.quantity());
                unitPrice = variant.getPrice();
                weight = variant.getWeight();
            } else {
                inventoryReservationService.reserve(product.getId(), product.getName(), line.quantity());
                unitPrice = product.getPrice();
                weight = product.getWeight();
            }

            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(line.quantity()));
            order.addItem(OrderItem.builder()
                    .product(product)
                    .variant(variant)
                    .productName(product.getName())
                    .productWeight(weight)
                    .quantity(line.quantity())
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal)
                    .build());
        }

        PricedOrder priced = pricingService.price(order.getItems());
        order.setSubtotal(priced.subtotal());
        order.setShippingFee(priced.shippingFee());
        order.setTotal(priced.total());

        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public OrderResponse getByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .map(orderMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(Long id) {
        return orderRepository.findById(id)
                .map(orderMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> list(OrderStatus status, Pageable pageable) {
        Page<Order> page = (status == null)
                ? orderRepository.findAll(pageable)
                : orderRepository.findAllByStatus(status, pageable);
        return PageResponse.map(page, orderMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> listByCustomer(Long customerId, Pageable pageable) {
        Page<Order> page = orderRepository.findAllByCustomerId(customerId, pageable);
        return PageResponse.map(page, orderMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getByOrderNumberForCustomer(String orderNumber, Long customerId) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));
        if (!order.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Order", "orderNumber", orderNumber);
        }
        return orderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        if (order.getStatus() == newStatus) {
            return orderMapper.toResponse(order);
        }
        if (!order.getStatus().canTransitionTo(newStatus)) {
            throw new BadRequestException(
                    "Illegal status transition: " + order.getStatus() + " → " + newStatus);
        }
        order.setStatus(newStatus);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    /**
     * Looks up the customer by email. If found, the existing record is returned unchanged —
     * we do NOT overwrite the stored full name or phone from order input, because doing so
     * would let any guest hijack another customer's record by placing an order with their
     * email. New customers are created lazily on first order.
     */
    private Customer findOrCreateCustomer(CreateOrderRequest.CustomerInfo info, CustomerPrincipal principal) {
        if (principal != null) {
            return customerRepository.findById(principal.customerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", principal.customerId()));
        }
        return customerRepository.findByEmailIgnoreCase(info.email())
                .orElseGet(() -> customerRepository.save(Customer.builder()
                        .fullName(info.fullName())
                        .email(info.email().toLowerCase())
                        .phone(info.phone())
                        .build()));
    }

    private void syncCustomerProfile(Customer customer,
                                     CreateOrderRequest.CustomerInfo info,
                                     CustomerPrincipal principal) {
        if (principal == null) {
            return;
        }

        String verifiedPhone = normalisePhone(principal.phone());
        String requestedPhone = normalisePhone(info.phone());
        if (!verifiedPhone.equals(requestedPhone)) {
            throw new BadRequestException("The order phone number must match the verified mobile number");
        }

        customer.setPhone(verifiedPhone);
        customer.setFullName(info.fullName().trim());

        String requestedEmail = info.email().trim().toLowerCase();
        if (shouldReplacePlaceholderEmail(customer.getEmail(), requestedEmail)) {
            customerRepository.findByEmailIgnoreCase(requestedEmail)
                    .filter(existing -> !existing.getId().equals(customer.getId()))
                    .ifPresent(existing -> {
                        throw new BadRequestException("That email is already linked to another customer");
                    });
            customer.setEmail(requestedEmail);
        }

        customerRepository.save(customer);
    }

    private boolean shouldReplacePlaceholderEmail(String currentEmail, String requestedEmail) {
        if (currentEmail == null || currentEmail.isBlank()) {
            return true;
        }
        if (currentEmail.equalsIgnoreCase(requestedEmail)) {
            return false;
        }
        return currentEmail.endsWith("@appaamma.local");
    }

    private Address resolveShippingAddress(Customer customer, CreateOrderRequest.ShippingAddressInfo info) {
        return customer.getAddresses().stream()
                .filter(existing -> addressesMatch(existing, info))
                .findFirst()
                .orElseGet(() -> appendShippingAddress(customer, info));
    }

    private Address appendShippingAddress(Customer customer, CreateOrderRequest.ShippingAddressInfo info) {
        Address address = Address.builder()
                .customer(customer)
                .line1(info.line1())
                .line2(info.line2())
                .city(info.city())
                .state(info.state())
                .pincode(info.pincode())
                .country("India")
                .landmark(info.landmark())
                .defaultAddress(customer.getAddresses().isEmpty())
                .build();
        customer.addAddress(address);
        addressRepository.save(address);
        customerRepository.save(customer);
        return address;
    }

    private boolean addressesMatch(Address existing, CreateOrderRequest.ShippingAddressInfo candidate) {
        return normaliseText(existing.getLine1()).equals(normaliseText(candidate.line1()))
                && normaliseText(existing.getLine2()).equals(normaliseText(candidate.line2()))
                && normaliseText(existing.getCity()).equals(normaliseText(candidate.city()))
                && normaliseText(existing.getState()).equals(normaliseText(candidate.state()))
                && normaliseText(existing.getPincode()).equals(normaliseText(candidate.pincode()))
                && normaliseText(existing.getLandmark()).equals(normaliseText(candidate.landmark()));
    }

    private String normaliseText(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private String normalisePhone(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }
}
