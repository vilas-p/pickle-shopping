package com.appaamma.pickles.api.v1.customeraddress;

import com.appaamma.pickles.api.v1.customeraddress.dto.AddressBookEntryResponse;
import com.appaamma.pickles.common.ApiResponse;
import com.appaamma.pickles.security.CustomerPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Customer Addresses", description = "Saved shipping addresses for authenticated customers")
@RestController
@RequestMapping("/api/v1/customer-addresses")
@RequiredArgsConstructor
public class AddressBookController {

    private final AddressBookService addressBookService;

    @Operation(summary = "List my saved shipping addresses")
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<List<AddressBookEntryResponse>> listMine(
            @AuthenticationPrincipal CustomerPrincipal principal
    ) {
        return ApiResponse.ok(addressBookService.listMine(principal));
    }
}