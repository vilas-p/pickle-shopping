package com.appaamma.pickles.api.v1.customerauth.dto;

import com.appaamma.pickles.domain.otp.OtpIdentifierKind;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RequestOtpRequest(
        @NotNull OtpIdentifierKind kind,
        @NotBlank @Size(max = 150) String identifier
) {}
