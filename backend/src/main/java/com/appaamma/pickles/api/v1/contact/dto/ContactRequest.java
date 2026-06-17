package com.appaamma.pickles.api.v1.contact.dto;

import jakarta.validation.constraints.*;

public record ContactRequest(
        @NotBlank @Size(max = 100) String fullName,
        @NotBlank @Email @Size(max = 150) String email,
        @Pattern(regexp = "^\\+?[0-9]{10,15}$|^$") String phone,
        @NotBlank @Size(max = 200) String subject,
        @NotBlank @Size(max = 5000) String message
) {}
