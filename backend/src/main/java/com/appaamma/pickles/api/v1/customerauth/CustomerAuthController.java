package com.appaamma.pickles.api.v1.customerauth;

import com.appaamma.pickles.api.v1.customerauth.dto.*;
import com.appaamma.pickles.common.ApiResponse;
import com.appaamma.pickles.security.CustomerPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Customer Auth", description = "OTP-based authentication for storefront customers")
@RestController
@RequestMapping("/api/v1/customer-auth")
@RequiredArgsConstructor
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;

    @Operation(summary = "Request an OTP for login (sent via SMS or email)")
    @PostMapping("/otp/request")
    public ResponseEntity<ApiResponse<RequestOtpResponse>> requestOtp(
            @Valid @RequestBody RequestOtpRequest request,
            HttpServletRequest http
    ) {
        RequestOtpResponse body = customerAuthService.requestLoginOtp(request, http);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.ok(body, "OTP sent"));
    }

    @Operation(summary = "Verify the OTP and exchange it for a customer access token")
    @PostMapping("/otp/verify")
    public ApiResponse<CustomerAuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ApiResponse.ok(customerAuthService.verifyAndIssueToken(request), "Login successful");
    }

    @Operation(summary = "Return the currently authenticated customer")
    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<CustomerAuthResponse.CustomerSummary> me(
            @AuthenticationPrincipal CustomerPrincipal principal
    ) {
        return ApiResponse.ok(customerAuthService.me(principal));
    }

    @Operation(summary = "Update the currently authenticated customer profile")
    @PutMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<CustomerAuthResponse.CustomerSummary> updateMe(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @Valid @RequestBody UpdateCustomerProfileRequest request
    ) {
        return ApiResponse.ok(customerAuthService.updateMe(principal, request), "Profile updated");
    }
}
