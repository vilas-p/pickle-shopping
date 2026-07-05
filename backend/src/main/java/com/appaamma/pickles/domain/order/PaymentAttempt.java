package com.appaamma.pickles.domain.order;

import com.appaamma.pickles.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "payment_attempts", uniqueConstraints = {
        @UniqueConstraint(name = "uk_payment_attempts_razorpay_order", columnNames = "razorpay_order_id"),
        @UniqueConstraint(name = "uk_payment_attempts_order_number", columnNames = "order_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentAttempt extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "razorpay_order_id", nullable = false, length = 64)
    private String razorpayOrderId;

    @Column(name = "order_number", nullable = false, length = 30)
    private String orderNumber;

    @Column(name = "razorpay_payment_id", length = 64, unique = true)
    private String razorpayPaymentId;

    @Column(name = "customer_account_id")
    private Long customerAccountId;

    @Column(name = "verified_phone", length = 20)
    private String verifiedPhone;

    @Column(name = "verified_email", length = 150)
    private String verifiedEmail;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(name = "customer_email", nullable = false, length = 150)
    private String customerEmail;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.CREATED;

    @Column(name = "gateway_status", length = 30)
    private String gatewayStatus;

    @Column(name = "failure_reason", length = 255)
    private String failureReason;

    @Lob
    @Column(name = "order_request_json", nullable = false, columnDefinition = "LONGTEXT")
    private String orderRequestJson;
}