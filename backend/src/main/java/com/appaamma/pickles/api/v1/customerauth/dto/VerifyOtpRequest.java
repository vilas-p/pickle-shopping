package com.appaamma.pickles.api.v1.customerauth.dto;

import com.appaamma.pickles.domain.otp.OtpIdentifierKind;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record VerifyOtpRequest(
        @NotNull OtpIdentifierKind kind,
        @NotBlank @Size(max = 150) String identifier,
        @NotBlank @Pattern(regexp = "^\\d{4,8}$", message = "Code must be 4–8 digits") String code,
        @Size(max = 100) String fullName
) {}
