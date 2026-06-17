package com.appaamma.pickles.api.v1.payment;

import com.appaamma.pickles.api.v1.payment.dto.CreatePaymentOrderRequest;
import com.appaamma.pickles.api.v1.payment.dto.PaymentOrderResponse;
import com.appaamma.pickles.api.v1.payment.dto.VerifyPaymentRequest;
import com.appaamma.pickles.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Payments", description = "Razorpay payment integration")
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "Create a Razorpay order for an existing order")
    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> createOrder(
            @Valid @RequestBody CreatePaymentOrderRequest request) {
        PaymentOrderResponse response = paymentService.createPaymentOrder(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Razorpay order created"));
    }

    @Operation(summary = "Verify Razorpay payment after checkout")
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Void>> verify(
            @Valid @RequestBody VerifyPaymentRequest request) {
        paymentService.verifyPayment(request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Payment verified successfully"));
    }
}
