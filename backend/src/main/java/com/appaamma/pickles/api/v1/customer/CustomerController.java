package com.appaamma.pickles.api.v1.customer;

import com.appaamma.pickles.api.v1.customer.dto.CustomerResponse;
import com.appaamma.pickles.common.ApiResponse;
import com.appaamma.pickles.common.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Customers", description = "[Admin] Customer management")
@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
public class CustomerController {

    private final CustomerService customerService;

    @Operation(summary = "Search/list customers")
    @GetMapping
    public ApiResponse<PageResponse<CustomerResponse>> list(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        return ApiResponse.ok(customerService.search(q, pageable));
    }

    @Operation(summary = "Get customer by id")
    @GetMapping("/{id}")
    public ApiResponse<CustomerResponse> byId(@PathVariable Long id) {
        return ApiResponse.ok(customerService.getById(id));
    }
}
