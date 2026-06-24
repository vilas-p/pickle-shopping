package com.appaamma.pickles.api.v1.customeraddress.dto;

public record AddressBookEntryResponse(
        Long id,
        String line1,
        String line2,
        String city,
        String state,
        String pincode,
        String landmark,
        boolean defaultAddress
) {
}