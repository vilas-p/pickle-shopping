package com.appaamma.pickles.api.v1.payment;

import com.appaamma.pickles.api.v1.order.dto.CreateOrderRequest;
import com.appaamma.pickles.api.v1.payment.dto.CancelPaymentOrderRequest;
import com.appaamma.pickles.api.v1.payment.dto.PaymentOrderResponse;
import com.appaamma.pickles.api.v1.payment.dto.VerifyPaymentRequest;
import com.appaamma.pickles.common.ApiResponse;
import com.appaamma.pickles.security.CustomerPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Payments", description = "Razorpay payment integration")
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "Create a Razorpay order for an existing order")
    @PostMapping("/create-order")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> createOrder(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @Valid @RequestBody CreateOrderRequest request) {
        PaymentOrderResponse response = paymentService.createPaymentOrder(request, principal);
        return ResponseEntity.ok(ApiResponse.ok(response, "Razorpay order created"));
    }

    @Operation(summary = "Verify Razorpay payment after checkout")
    @PostMapping("/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> verify(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @Valid @RequestBody VerifyPaymentRequest request) {
        paymentService.verifyPayment(principal, request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Payment verified successfully"));
    }

    @Operation(summary = "Cancel an unpaid online order after checkout is dismissed or payment setup fails")
    @PostMapping("/cancel-order")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @Valid @RequestBody CancelPaymentOrderRequest request) {
        paymentService.cancelUnpaidOrder(principal, request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Unpaid order cancelled"));
    }

    @Operation(summary = "Process Razorpay payment webhooks")
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> webhook(
            @RequestHeader("X-Razorpay-Signature") String signature,
            @RequestBody String payload) {
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
