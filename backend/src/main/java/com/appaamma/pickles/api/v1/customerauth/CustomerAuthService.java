package com.appaamma.pickles.api.v1.customerauth;

import com.appaamma.pickles.api.v1.customerauth.dto.CustomerAuthResponse;
import com.appaamma.pickles.api.v1.customerauth.dto.RequestOtpRequest;
import com.appaamma.pickles.api.v1.customerauth.dto.RequestOtpResponse;
import com.appaamma.pickles.api.v1.customerauth.dto.VerifyOtpRequest;
import com.appaamma.pickles.domain.customer.Customer;
import com.appaamma.pickles.domain.customer.CustomerRepository;
import com.appaamma.pickles.domain.otp.OtpIdentifierKind;
import com.appaamma.pickles.domain.otp.OtpPurpose;
import com.appaamma.pickles.exception.BadRequestException;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import com.appaamma.pickles.security.CustomerJwtTokenProvider;
import com.appaamma.pickles.security.CustomerPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerAuthService {

    private final OtpService otpService;
    private final CustomerRepository customerRepository;
    private final CustomerJwtTokenProvider tokenProvider;

    @Transactional
    public RequestOtpResponse requestLoginOtp(RequestOtpRequest req, HttpServletRequest http) {
        OtpService.IssueResult result = otpService.issue(
                req.kind(),
                req.identifier(),
                OtpPurpose.LOGIN,
                http.getRemoteAddr(),
                truncate(http.getHeader("User-Agent"), 500)
        );
        return new RequestOtpResponse(result.channel(), result.expiresAt());
    }

    /**
     * Verifies the OTP and issues a customer JWT. If no customer record exists for the
     * identifier, one is created on-the-fly using {@code fullName} (required for first-time
     * login). Returning customers do not need to resubmit their name — the stored value wins.
     */
    @Transactional
    public CustomerAuthResponse verifyAndIssueToken(VerifyOtpRequest req) {
        String normalised = otpService.verify(req.kind(), req.identifier(), OtpPurpose.LOGIN, req.code());
        Customer customer = (req.kind() == OtpIdentifierKind.PHONE)
                ? findOrCreateByPhone(normalised, req.fullName())
                : findOrCreateByEmail(normalised, req.fullName());

        String token = tokenProvider.generateToken(customer.getId(), customer.getPhone(), customer.getEmail());
        return new CustomerAuthResponse(
                token,
                "Bearer",
                tokenProvider.getExpirationMs(),
                new CustomerAuthResponse.CustomerSummary(
                        customer.getId(), customer.getFullName(), customer.getEmail(), customer.getPhone())
        );
    }

    @Transactional(readOnly = true)
    public CustomerAuthResponse.CustomerSummary me(CustomerPrincipal principal) {
        Customer c = customerRepository.findById(principal.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", principal.customerId()));
        return new CustomerAuthResponse.CustomerSummary(c.getId(), c.getFullName(), c.getEmail(), c.getPhone());
    }

    private Customer findOrCreateByPhone(String phone, String fullName) {
        return customerRepository.findByPhone(phone).orElseGet(() -> {
            requireName(fullName);
            return customerRepository.save(Customer.builder()
                    .fullName(fullName.trim())
                    .phone(phone)
                    // Email is required on the entity; until they add one we synthesise a
                    // unique placeholder. Their profile screen prompts for the real address.
                    .email("pending+" + phone + "@appaamma.local")
                    .build());
        });
    }

    private Customer findOrCreateByEmail(String email, String fullName) {
        return customerRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            requireName(fullName);
            return customerRepository.save(Customer.builder()
                    .fullName(fullName.trim())
                    .email(email)
                    .phone("0000000000")
                    .build());
        });
    }

    private void requireName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            throw new BadRequestException("Full name is required to create a new account");
        }
    }

    private String truncate(String value, int max) {
        if (value == null) return null;
        return value.length() <= max ? value : value.substring(0, max);
    }
}
