package com.appaamma.pickles.api.v1.notification;

import com.appaamma.pickles.api.v1.notification.event.*;
import com.appaamma.pickles.config.OtpProperties;
import com.appaamma.pickles.domain.otp.OtpIdentifierKind;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final OtpProperties otpProperties;

    @EventListener
    public void onUserRegistered(UserRegisteredEvent event) {
        if (event.email() != null && !event.email().isBlank()) {
            notificationService.sendEmail("USER_REGISTERED_EMAIL", event.email(), Map.of(
                    "CustomerName", valueOrDefault(event.customerName(), "Customer")
            ));
        }
    }

    @EventListener
    public void onLoginOtpRequested(LoginOtpRequestedEvent event) {
        Map<String, Object> variables = new LinkedHashMap<>();
        variables.put("CustomerName", valueOrDefault(event.customerName(), "Customer"));
        variables.put("OTP", event.otp());
        variables.put("ExpiryMinutes", event.expiryMinutes());

        if (event.kind() == OtpIdentifierKind.PHONE) {
            if (otpProperties.phoneChannel() == OtpProperties.PhoneChannel.WHATSAPP) {
                notificationService.sendWhatsApp("LOGIN_OTP_WHATSAPP", event.recipient(), variables);
            } else {
                notificationService.sendSms("LOGIN_OTP_SMS", event.recipient(), variables);
            }
            return;
        }

        notificationService.sendEmail("LOGIN_OTP_EMAIL", event.recipient(), variables);
    }

    @EventListener
    public void onOrderPlaced(OrderPlacedEvent event) {
        NotificationOrderContext context = event.context();
        Map<String, Object> variables = orderVariables(context);
        if (hasText(context.phone())) {
            notificationService.sendWhatsApp("ORDER_PLACED_WHATSAPP", context.phone(), variables);
        }
        if (hasText(context.email())) {
            notificationService.sendEmail("ORDER_PLACED_EMAIL", context.email(), variables);
        }
    }

    @EventListener
    public void onPaymentSuccess(PaymentSuccessEvent event) {
        NotificationOrderContext context = event.context();
        if (hasText(context.phone())) {
            notificationService.sendWhatsApp("PAYMENT_SUCCESS_WHATSAPP", context.phone(), orderVariables(context));
        }
    }

    @EventListener
    public void onOrderPacked(OrderPackedEvent event) {
        NotificationOrderContext context = event.context();
        if (hasText(context.phone())) {
            notificationService.sendWhatsApp("ORDER_PACKED_WHATSAPP", context.phone(), orderVariables(context));
        }
    }

    @EventListener
    public void onOrderShipped(OrderShippedEvent event) {
        NotificationOrderContext context = event.context();
        if (hasText(context.phone())) {
            notificationService.sendWhatsApp("ORDER_SHIPPED_WHATSAPP", context.phone(), orderVariables(context));
        }
    }

    @EventListener
    public void onOutForDelivery(OutForDeliveryEvent event) {
        NotificationOrderContext context = event.context();
        if (hasText(context.phone())) {
            notificationService.sendWhatsApp("OUT_FOR_DELIVERY_WHATSAPP", context.phone(), orderVariables(context));
        }
    }

    @EventListener
    public void onOrderDelivered(OrderDeliveredEvent event) {
        NotificationOrderContext context = event.context();
        Map<String, Object> variables = orderVariables(context);
        if (hasText(context.phone())) {
            notificationService.sendWhatsApp("ORDER_DELIVERED_WHATSAPP", context.phone(), variables);
        }
        if (hasText(context.email())) {
            notificationService.sendEmail("ORDER_DELIVERED_EMAIL", context.email(), variables);
        }
        applicationEventPublisher.publishEvent(new ReviewRequestEvent(context));
    }

    @EventListener
    public void onReviewRequest(ReviewRequestEvent event) {
        NotificationOrderContext context = event.context();
        if (hasText(context.phone())) {
            notificationService.sendWhatsApp("REVIEW_REQUEST_WHATSAPP", context.phone(), orderVariables(context));
        }
    }

    private Map<String, Object> orderVariables(NotificationOrderContext context) {
        Map<String, Object> variables = new LinkedHashMap<>();
        variables.put("CustomerName", valueOrDefault(context.customerName(), "Customer"));
        variables.put("OrderId", valueOrDefault(context.orderId(), ""));
        variables.put("Amount", context.amount() != null ? context.amount() : "");
        variables.put("Items", valueOrDefault(context.items(), ""));
        variables.put("TrackingNumber", valueOrDefault(context.trackingNumber(), ""));
        variables.put("TrackingUrl", valueOrDefault(context.trackingUrl(), ""));
        variables.put("ReviewLink", valueOrDefault(context.reviewLink(), "/reviews"));
        return variables;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String valueOrDefault(String value, String fallback) {
        return hasText(value) ? value : fallback;
    }
}