package com.appaamma.pickles.api.v1.payment;

import com.appaamma.pickles.api.v1.order.OrderPricingService.PricedOrder;
import com.appaamma.pickles.api.v1.order.OrderNumberGenerator;
import com.appaamma.pickles.api.v1.order.OrderService;
import com.appaamma.pickles.api.v1.order.dto.CreateOrderRequest;
import com.appaamma.pickles.api.v1.notification.event.NotificationOrderContext;
import com.appaamma.pickles.api.v1.notification.event.PaymentSuccessEvent;
import com.appaamma.pickles.api.v1.payment.dto.CancelPaymentOrderRequest;
import com.appaamma.pickles.api.v1.payment.dto.PaymentOrderResponse;
import com.appaamma.pickles.api.v1.payment.dto.VerifyPaymentRequest;
import com.appaamma.pickles.config.RazorpayProperties;
import com.appaamma.pickles.domain.audit.AuditLogService;
import com.appaamma.pickles.domain.inventory.InventoryReservationService;
import com.appaamma.pickles.domain.order.*;
import com.appaamma.pickles.exception.BadRequestException;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import com.appaamma.pickles.security.CustomerPrincipal;
import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigInteger;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PaymentService {

    private static final String GATEWAY_STATUS_CREATED = "created";
    private static final String GATEWAY_STATUS_AUTHORIZED = "authorized";
    private static final String GATEWAY_STATUS_CAPTURED = "captured";
    private static final String GATEWAY_STATUS_FAILED = "failed";
    private static final String PAYMENT_UNAVAILABLE_MESSAGE =
            "Online payments are temporarily unavailable. Please try again later or use cash on delivery.";

    private final RazorpayClient razorpayClient;
    private final RazorpayProperties razorpayProperties;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final InventoryReservationService inventoryReservationService;
    private final OrderService orderService;
    private final OrderNumberGenerator orderNumberGenerator;
    private final ObjectMapper objectMapper;
    private final AuditLogService auditLogService;

    public PaymentService(RazorpayProperties razorpayProperties,
                          OrderRepository orderRepository,
                          PaymentRepository paymentRepository,
                          PaymentAttemptRepository paymentAttemptRepository,
                          ApplicationEventPublisher applicationEventPublisher,
                          InventoryReservationService inventoryReservationService,
                          OrderService orderService,
                          OrderNumberGenerator orderNumberGenerator,
                          ObjectMapper objectMapper,
                          AuditLogService auditLogService) {
        this.razorpayProperties = razorpayProperties;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.paymentAttemptRepository = paymentAttemptRepository;
        this.applicationEventPublisher = applicationEventPublisher;
        this.inventoryReservationService = inventoryReservationService;
        this.orderService = orderService;
        this.orderNumberGenerator = orderNumberGenerator;
        this.objectMapper = objectMapper;
        this.auditLogService = auditLogService;
        try {
            this.razorpayClient = new RazorpayClient(razorpayProperties.keyId(), razorpayProperties.keySecret());
        } catch (RazorpayException e) {
            throw new IllegalStateException("Failed to initialise Razorpay client", e);
        }
    }

    @Transactional
    public PaymentOrderResponse createPaymentOrder(CreateOrderRequest req, CustomerPrincipal principal) {
        requireAuthenticatedCustomer(principal);
        assertGatewayConfigured();
        PaymentMethod paymentMethod = req.paymentMethod() != null ? req.paymentMethod() : PaymentMethod.COD;
        if (paymentMethod != PaymentMethod.RAZORPAY && paymentMethod != PaymentMethod.UPI) {
            throw new BadRequestException("Online payment API only supports UPI and card orders");
        }

        orderService.validateCheckoutForAuthenticatedCustomer(req, principal);
        PricedOrder priced = orderService.validateAndPriceItems(req, true);
        String orderNumber = orderNumberGenerator.next();
        long amountInPaise = priced.total().multiply(BigDecimal.valueOf(100)).longValue();

        try {
            JSONObject options = new JSONObject();
            options.put("amount", amountInPaise);
            options.put("currency", "INR");
            options.put("receipt", orderNumber);

            Order rpOrder = razorpayClient.orders.create(options);
            String rpOrderId = rpOrder.get("id");

            PaymentAttempt attempt = PaymentAttempt.builder()
                    .razorpayOrderId(rpOrderId)
                    .orderNumber(orderNumber)
                    .customerAccountId(principal != null ? principal.customerId() : null)
                    .verifiedPhone(principal != null ? principal.phone() : null)
                    .verifiedEmail(principal != null ? principal.email() : null)
                    .customerName(req.customer().fullName())
                    .customerEmail(req.customer().email())
                    .customerPhone(req.customer().phone())
                    .paymentMethod(paymentMethod)
                    .amount(priced.total())
                    .currency("INR")
                    .status(PaymentStatus.CREATED)
                    .orderRequestJson(writeOrderRequest(req))
                    .build();
            paymentAttemptRepository.save(attempt);

            return toResponse(attempt);
        } catch (RazorpayException e) {
            log.error(
                    "Razorpay order creation failed for provisional order {}: keyId={} amountPaise={} reason={}",
                    orderNumber,
                    maskKeyId(razorpayProperties.keyId()),
                    amountInPaise,
                    e.getMessage(),
                    e
            );
            throw new BadRequestException(PAYMENT_UNAVAILABLE_MESSAGE);
        }
    }

    private void assertGatewayConfigured() {
        if (looksLikePlaceholderCredential(razorpayProperties.keyId())
                || looksLikePlaceholderCredential(razorpayProperties.keySecret())) {
            log.error(
                    "Razorpay payment request rejected because gateway credentials are not configured: keyId={}",
                    maskKeyId(razorpayProperties.keyId())
            );
            throw new BadRequestException(PAYMENT_UNAVAILABLE_MESSAGE);
        }
    }

    private boolean looksLikePlaceholderCredential(String value) {
        if (value == null || value.isBlank()) {
            return true;
        }

        String normalised = value.trim().toLowerCase();
        return normalised.startsWith("dev-")
                || normalised.contains("placeholder")
                || normalised.contains("dummy")
                || normalised.equals("changeme");
    }

    private String maskKeyId(String keyId) {
        if (keyId == null || keyId.isBlank()) {
            return "<empty>";
        }
        if (keyId.length() <= 6) {
            return "***";
        }
        return keyId.substring(0, 4) + "***" + keyId.substring(keyId.length() - 2);
    }

    @Transactional
    public void verifyPayment(CustomerPrincipal principal, VerifyPaymentRequest req) {
        requireAuthenticatedCustomer(principal);
        com.appaamma.pickles.domain.order.Payment existingPayment = paymentRepository.findByRazorpayPaymentId(req.razorpayPaymentId())
                .orElse(null);
        if (existingPayment != null && !existingPayment.getRazorpayOrderId().equals(req.razorpayOrderId())) {
            throw new BadRequestException("Payment ID already linked to another order");
        }

        PaymentAttempt attempt = paymentAttemptRepository.findByRazorpayOrderId(req.razorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("PaymentAttempt", "razorpayOrderId", req.razorpayOrderId()));
        assertAttemptOwnership(attempt, principal);

        if (attempt.getRazorpayPaymentId() != null && !attempt.getRazorpayPaymentId().equals(req.razorpayPaymentId())) {
            throw new BadRequestException("This payment order is already bound to another payment transaction");
        }

        if (attempt.getStatus() != PaymentStatus.CREATED) {
            if (attempt.getStatus() == PaymentStatus.CAPTURED
                    && req.razorpayPaymentId().equals(attempt.getRazorpayPaymentId())) {
                return;
            }
            throw new BadRequestException("Payment already processed");
        }

        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", req.razorpayOrderId());
            attributes.put("razorpay_payment_id", req.razorpayPaymentId());
            attributes.put("razorpay_signature", req.razorpaySignature());

            boolean valid = Utils.verifyPaymentSignature(attributes, razorpayProperties.keySecret());
            if (!valid) {
                markAttemptFailed(attempt, "signature_mismatch");
                throw new BadRequestException("Payment verification failed — signature mismatch");
            }
        } catch (RazorpayException e) {
            markAttemptFailed(attempt, "signature_verification_error");
            throw new BadRequestException("Payment verification failed");
        }

        GatewayPaymentSnapshot gateway = fetchAndValidateGatewayPayment(attempt, req.razorpayPaymentId(), req.razorpayOrderId());
        if (GATEWAY_STATUS_AUTHORIZED.equals(gateway.status())) {
            gateway = captureAuthorizedPayment(gateway, attempt);
        }
        if (!GATEWAY_STATUS_CAPTURED.equals(gateway.status())) {
            markAttemptFailed(attempt, "gateway_status_" + gateway.status());
            throw new BadRequestException("Payment has not been captured by Razorpay");
        }

        CreateOrderRequest orderRequest = readOrderRequest(attempt);
        CustomerPrincipal attemptPrincipal = attempt.getCustomerAccountId() != null
                ? new CustomerPrincipal(attempt.getCustomerAccountId(), attempt.getVerifiedPhone(), attempt.getVerifiedEmail())
                : null;
        com.appaamma.pickles.domain.order.Order order = orderService.createPaidOnlineOrder(orderRequest, attemptPrincipal, attempt.getOrderNumber());
        order.setRazorpayOrderId(req.razorpayOrderId());
        orderRepository.save(order);

        persistCapturedPayment(order, attempt, req.razorpayPaymentId(), req.razorpaySignature(), gateway.status());
        attempt.setRazorpayPaymentId(req.razorpayPaymentId());
        attempt.setGatewayStatus(gateway.status());
        attempt.setFailureReason(null);
        attempt.setStatus(PaymentStatus.CAPTURED);
        paymentAttemptRepository.save(attempt);
        auditLogService.log(
            "PAYMENT_CAPTURED",
            "PaymentAttempt",
            String.valueOf(attempt.getId()),
            Map.of(
                "orderNumber", attempt.getOrderNumber(),
                "razorpayOrderId", attempt.getRazorpayOrderId(),
                "razorpayPaymentId", req.razorpayPaymentId(),
                "amount", attempt.getAmount(),
                "currency", attempt.getCurrency()
            )
        );

        applicationEventPublisher.publishEvent(new PaymentSuccessEvent(toNotificationContext(order)));

        log.info("Payment verified for order {}: razorpay_payment_id={}", order.getOrderNumber(), req.razorpayPaymentId());
    }

    @Transactional
    public void cancelUnpaidOrder(CustomerPrincipal principal, CancelPaymentOrderRequest req) {
        requireAuthenticatedCustomer(principal);
        PaymentAttempt attempt = paymentAttemptRepository.findByRazorpayOrderId(req.razorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("PaymentAttempt", "razorpayOrderId", req.razorpayOrderId()));
        assertAttemptOwnership(attempt, principal);

        if (attempt.getStatus() == PaymentStatus.CAPTURED) {
            throw new BadRequestException("Captured payments cannot be cancelled automatically");
        }

        if (attempt.getStatus() == PaymentStatus.CREATED) {
            markAttemptFailed(attempt, "cancelled_by_customer");
        }
    }

    @Transactional
    public void handleWebhook(String payload, String signature) {
        verifyWebhookSignature(payload, signature);

        JsonNode root = parseWebhookPayload(payload);
        String event = root.path("event").asText();
        JsonNode paymentEntity = root.path("payload").path("payment").path("entity");
        String razorpayPaymentId = textValue(paymentEntity, "id");
        String razorpayOrderId = textValue(paymentEntity, "order_id");

        if (razorpayOrderId == null || razorpayOrderId.isBlank()) {
            log.warn("Ignoring Razorpay webhook without order id: event={}", event);
            return;
        }

        PaymentAttempt attempt = paymentAttemptRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElse(null);
        if (attempt == null) {
            log.warn("Ignoring Razorpay webhook for unknown order: event={} razorpay_order_id={}", event, razorpayOrderId);
            return;
        }

        switch (event) {
            case "payment.authorized", "payment.captured" -> reconcileCapturedWebhook(attempt, razorpayPaymentId, razorpayOrderId);
            case "payment.failed" -> markAttemptFailed(attempt, paymentEntity.path("error_description").asText("gateway_payment_failed"));
            case "refund.processed", "payment.refunded" -> reconcileRefundWebhook(attempt, razorpayPaymentId, razorpayOrderId);
            default -> log.info("Ignoring unsupported Razorpay webhook event={} razorpay_order_id={}", event, razorpayOrderId);
        }
    }

    private void markAttemptFailed(PaymentAttempt attempt, String reason) {
        if (attempt.getStatus() != PaymentStatus.CREATED) {
            return;
        }

        CreateOrderRequest orderRequest = readOrderRequest(attempt);
        orderRequest.items().forEach(item -> {
            if (item.variantId() != null) {
                inventoryReservationService.releaseVariant(item.variantId(), item.quantity());
            } else {
                inventoryReservationService.release(item.productId(), item.quantity());
            }
        });

        attempt.setFailureReason(reason);
        attempt.setGatewayStatus(GATEWAY_STATUS_FAILED);
        attempt.setStatus(PaymentStatus.FAILED);
        paymentAttemptRepository.save(attempt);
        auditLogService.log(
            "PAYMENT_FAILED",
            "PaymentAttempt",
            String.valueOf(attempt.getId()),
            Map.of(
                "orderNumber", attempt.getOrderNumber(),
                "razorpayOrderId", attempt.getRazorpayOrderId(),
                "reason", reason
            )
        );
        log.warn("Payment attempt marked failed: orderNumber={} razorpayOrderId={} reason={}",
                attempt.getOrderNumber(), attempt.getRazorpayOrderId(), reason);
    }

    private GatewayPaymentSnapshot fetchAndValidateGatewayPayment(PaymentAttempt attempt,
                                                                  String razorpayPaymentId,
                                                                  String razorpayOrderId) {
        try {
            Payment gatewayPayment = razorpayClient.payments.fetch(razorpayPaymentId);
            String gatewayOrderId = gatewayPayment.get("order_id");
            String status = gatewayPayment.get("status");
            String currency = gatewayPayment.get("currency");
            long amountInPaise = gatewayPayment.get("amount");

            if (!razorpayOrderId.equals(gatewayOrderId)) {
                markAttemptFailed(attempt, "gateway_order_mismatch");
                throw new BadRequestException("Gateway order mismatch during payment verification");
            }
            if (!attempt.getCurrency().equalsIgnoreCase(currency)) {
                markAttemptFailed(attempt, "currency_mismatch");
                throw new BadRequestException("Gateway currency mismatch during payment verification");
            }

            long expectedAmountInPaise = attempt.getAmount().multiply(BigDecimal.valueOf(100)).longValue();
            if (expectedAmountInPaise != amountInPaise) {
                markAttemptFailed(attempt, "amount_mismatch");
                throw new BadRequestException("Gateway amount mismatch during payment verification");
            }

            if (GATEWAY_STATUS_FAILED.equals(status)) {
                markAttemptFailed(attempt, "gateway_payment_failed");
                throw new BadRequestException("Gateway reported the payment as failed");
            }

            return new GatewayPaymentSnapshot(razorpayPaymentId, gatewayOrderId, status, currency, amountInPaise);
        } catch (RazorpayException e) {
            throw new BadRequestException("Unable to verify payment status with Razorpay");
        }
    }

    private GatewayPaymentSnapshot captureAuthorizedPayment(GatewayPaymentSnapshot gateway, PaymentAttempt attempt) {
        try {
            JSONObject capture = new JSONObject();
            capture.put("amount", gateway.amountInPaise());
            capture.put("currency", gateway.currency());
            Payment captured = razorpayClient.payments.capture(gateway.razorpayPaymentId(), capture);
            String capturedStatus = captured.get("status");
            if (!GATEWAY_STATUS_CAPTURED.equals(capturedStatus)) {
                markAttemptFailed(attempt, "capture_status_" + capturedStatus);
                throw new BadRequestException("Razorpay did not capture the authorized payment");
            }
            return new GatewayPaymentSnapshot(
                    gateway.razorpayPaymentId(),
                    gateway.razorpayOrderId(),
                    capturedStatus,
                    captured.get("currency"),
                    captured.get("amount")
            );
        } catch (RazorpayException e) {
            markAttemptFailed(attempt, "capture_failed");
            throw new BadRequestException("Unable to capture the authorized payment");
        }
    }

    private void persistCapturedPayment(com.appaamma.pickles.domain.order.Order order,
                                        PaymentAttempt attempt,
                                        String razorpayPaymentId,
                                        String razorpaySignature,
                                        String gatewayStatus) {
        com.appaamma.pickles.domain.order.Payment payment = paymentRepository.findByRazorpayPaymentId(razorpayPaymentId)
            .orElseGet(() -> com.appaamma.pickles.domain.order.Payment.builder()
                        .order(order)
                        .razorpayOrderId(attempt.getRazorpayOrderId())
                        .razorpayPaymentId(razorpayPaymentId)
                        .amount(attempt.getAmount())
                        .currency(attempt.getCurrency())
                        .build());
        payment.setOrder(order);
        payment.setRazorpayOrderId(attempt.getRazorpayOrderId());
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(razorpaySignature);
        payment.setAmount(attempt.getAmount());
        payment.setCurrency(attempt.getCurrency());
        payment.setGatewayStatus(gatewayStatus);
        payment.setStatus(PaymentStatus.CAPTURED);
        paymentRepository.save(payment);
    }

    private void reconcileCapturedWebhook(PaymentAttempt attempt, String razorpayPaymentId, String razorpayOrderId) {
        if (razorpayPaymentId == null || razorpayPaymentId.isBlank()) {
            log.warn("Ignoring capture webhook without payment id for razorpay_order_id={}", razorpayOrderId);
            return;
        }

        com.appaamma.pickles.domain.order.Payment existing = paymentRepository.findByRazorpayPaymentId(razorpayPaymentId).orElse(null);
        if (existing != null) {
            if (existing.getStatus() != PaymentStatus.CAPTURED) {
                existing.setStatus(PaymentStatus.CAPTURED);
                existing.setGatewayStatus(GATEWAY_STATUS_CAPTURED);
                paymentRepository.save(existing);
            }
            return;
        }

        if (attempt.getStatus() != PaymentStatus.CAPTURED) {
            log.warn("Received capture webhook before successful API verification: razorpay_order_id={} razorpay_payment_id={}",
                    razorpayOrderId, razorpayPaymentId);
        }
    }

    private void reconcileRefundWebhook(PaymentAttempt attempt, String razorpayPaymentId, String razorpayOrderId) {
        com.appaamma.pickles.domain.order.Payment payment = paymentRepository.findByRazorpayPaymentId(razorpayPaymentId)
                .orElse(null);
        if (payment == null) {
            log.warn("Received refund webhook for unknown payment: razorpay_order_id={} razorpay_payment_id={}",
                    razorpayOrderId, razorpayPaymentId);
            return;
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setGatewayStatus("refunded");
        paymentRepository.save(payment);
        auditLogService.log(
            "PAYMENT_REFUNDED",
            "Payment",
            String.valueOf(payment.getId()),
            Map.of(
                "orderId", payment.getOrder().getId(),
                "razorpayOrderId", razorpayOrderId,
                "razorpayPaymentId", razorpayPaymentId
            )
        );
        log.warn("Payment refunded: orderId={} razorpay_payment_id={}", payment.getOrder().getId(), razorpayPaymentId);
    }

    private void verifyWebhookSignature(String payload, String signature) {
        String expected = hmacSha256(payload, razorpayProperties.webhookSecret());
        if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8))) {
            throw new BadRequestException("Invalid Razorpay webhook signature");
        }
    }

    private JsonNode parseWebhookPayload(String payload) {
        try {
            return objectMapper.readTree(payload);
        } catch (JsonProcessingException e) {
            throw new BadRequestException("Invalid Razorpay webhook payload");
        }
    }

    private String textValue(JsonNode node, String fieldName) {
        JsonNode value = node.path(fieldName);
        return value.isMissingNode() || value.isNull() ? null : value.asText();
    }

    private String hmacSha256(String payload, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return String.format("%064x", new BigInteger(1, digest));
        } catch (Exception e) {
            throw new IllegalStateException("Failed to verify Razorpay webhook signature", e);
        }
    }

    private void requireAuthenticatedCustomer(CustomerPrincipal principal) {
        if (principal == null || principal.customerId() == null) {
            throw new BadRequestException("A verified customer session is required for online payments");
        }
    }

    private void assertAttemptOwnership(PaymentAttempt attempt, CustomerPrincipal principal) {
        if (attempt.getCustomerAccountId() == null
                || !attempt.getCustomerAccountId().equals(principal.customerId())) {
            throw new ResourceNotFoundException("PaymentAttempt", "razorpayOrderId", attempt.getRazorpayOrderId());
        }
    }

    private NotificationOrderContext toNotificationContext(com.appaamma.pickles.domain.order.Order order) {
        return new NotificationOrderContext(
                order.getCustomer().getFullName(),
                order.getCustomer().getEmail(),
                order.getCustomer().getPhone(),
                order.getOrderNumber(),
                order.getTotal(),
                order.getItems().stream()
                        .map(item -> item.getProductName() + " x" + item.getQuantity())
                        .collect(Collectors.joining(", ")),
                "",
                "",
                "/reviews?order=" + order.getOrderNumber()
        );
    }

    private PaymentOrderResponse toResponse(PaymentAttempt attempt) {
        return new PaymentOrderResponse(
                attempt.getRazorpayOrderId(),
                attempt.getAmount(),
                attempt.getCurrency(),
                razorpayProperties.keyId(),
                attempt.getOrderNumber(),
                attempt.getCustomerName(),
                attempt.getCustomerEmail(),
                attempt.getCustomerPhone()
        );
    }

    private String writeOrderRequest(CreateOrderRequest req) {
        try {
            return objectMapper.writeValueAsString(req);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize payment attempt", e);
        }
    }

    private CreateOrderRequest readOrderRequest(PaymentAttempt attempt) {
        try {
            return objectMapper.readValue(attempt.getOrderRequestJson(), CreateOrderRequest.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to read stored payment attempt", e);
        }
    }

    private record GatewayPaymentSnapshot(
            String razorpayPaymentId,
            String razorpayOrderId,
            String status,
            String currency,
            long amountInPaise
    ) {}
}
