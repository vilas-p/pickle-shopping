package com.appaamma.pickles.api.v1.customeraddress.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SaveAddressBookEntryRequest(
        @NotBlank @Size(max = 200) String line1,
        @Size(max = 200) String line2,
        @NotBlank @Size(max = 100) String city,
        @NotBlank @Size(max = 100) String state,
        @NotBlank @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Pincode must be 6 digits") String pincode,
        @Size(max = 500) String landmark,
        boolean defaultAddress
) {}