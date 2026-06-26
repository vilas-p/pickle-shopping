package com.appaamma.pickles.api.v1.payment;

import com.appaamma.pickles.api.v1.payment.dto.CreatePaymentOrderRequest;
import com.appaamma.pickles.api.v1.payment.dto.PaymentOrderResponse;
import com.appaamma.pickles.api.v1.payment.dto.VerifyPaymentRequest;
import com.appaamma.pickles.config.RazorpayProperties;
import com.appaamma.pickles.domain.order.*;
import com.appaamma.pickles.exception.BadRequestException;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
public class PaymentService {

    private final RazorpayClient razorpayClient;
    private final RazorpayProperties razorpayProperties;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public PaymentService(RazorpayProperties razorpayProperties,
                          OrderRepository orderRepository,
                          PaymentRepository paymentRepository) {
        this.razorpayProperties = razorpayProperties;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        try {
            this.razorpayClient = new RazorpayClient(razorpayProperties.keyId(), razorpayProperties.keySecret());
        } catch (RazorpayException e) {
            throw new IllegalStateException("Failed to initialise Razorpay client", e);
        }
    }

    @Transactional
    public PaymentOrderResponse createPaymentOrder(CreatePaymentOrderRequest req) {
        com.appaamma.pickles.domain.order.Order order = orderRepository.findById(req.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", req.orderId()));

        if (order.getPaymentMethod() != PaymentMethod.RAZORPAY
            && order.getPaymentMethod() != PaymentMethod.UPI) {
            throw new BadRequestException("Order is not marked for online payment");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order is not in PENDING state");
        }
        // If a Razorpay order already exists, return it
        if (order.getRazorpayOrderId() != null) {
            Payment existing = paymentRepository.findByRazorpayOrderId(order.getRazorpayOrderId())
                    .orElse(null);
            if (existing != null && existing.getStatus() == PaymentStatus.CREATED) {
                return toResponse(order, existing.getRazorpayOrderId());
            }
        }

        // Amount in paise (smallest currency unit)
        long amountInPaise = order.getTotal().multiply(BigDecimal.valueOf(100)).longValue();

        try {
            JSONObject options = new JSONObject();
            options.put("amount", amountInPaise);
            options.put("currency", "INR");
            options.put("receipt", order.getOrderNumber());

            Order rpOrder = razorpayClient.orders.create(options);
            String rpOrderId = rpOrder.get("id");

            order.setRazorpayOrderId(rpOrderId);
            orderRepository.save(order);

            Payment payment = Payment.builder()
                    .order(order)
                    .razorpayOrderId(rpOrderId)
                    .amount(order.getTotal())
                    .currency("INR")
                    .status(PaymentStatus.CREATED)
                    .build();
            paymentRepository.save(payment);

            return toResponse(order, rpOrderId);
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed for order {}: {}", order.getOrderNumber(), e.getMessage());
            throw new BadRequestException("Payment gateway error. Please try again.");
        }
    }

    @Transactional
    public void verifyPayment(VerifyPaymentRequest req) {
        Payment payment = paymentRepository.findByRazorpayOrderId(req.razorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "razorpayOrderId", req.razorpayOrderId()));

        if (payment.getStatus() != PaymentStatus.CREATED) {
            throw new BadRequestException("Payment already processed");
        }

        // Verify signature using Razorpay utility
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", req.razorpayOrderId());
            attributes.put("razorpay_payment_id", req.razorpayPaymentId());
            attributes.put("razorpay_signature", req.razorpaySignature());

            boolean valid = Utils.verifyPaymentSignature(attributes, razorpayProperties.keySecret());
            if (!valid) {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                throw new BadRequestException("Payment verification failed — signature mismatch");
            }
        } catch (RazorpayException e) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new BadRequestException("Payment verification failed");
        }

        // Mark payment as captured and transition order to CONFIRMED
        payment.setRazorpayPaymentId(req.razorpayPaymentId());
        payment.setRazorpaySignature(req.razorpaySignature());
        payment.setStatus(PaymentStatus.CAPTURED);
        paymentRepository.save(payment);

        com.appaamma.pickles.domain.order.Order order = payment.getOrder();
        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
        }

        log.info("Payment verified for order {}: razorpay_payment_id={}", order.getOrderNumber(), req.razorpayPaymentId());
    }

    private PaymentOrderResponse toResponse(com.appaamma.pickles.domain.order.Order order, String rpOrderId) {
        return new PaymentOrderResponse(
                rpOrderId,
                order.getTotal(),
                "INR",
                razorpayProperties.keyId(),
                order.getOrderNumber(),
                order.getCustomer().getFullName(),
                order.getCustomer().getEmail(),
                order.getCustomer().getPhone()
        );
    }
}
