package com.appaamma.pickles.api.v1.contact;

import com.appaamma.pickles.api.v1.contact.dto.ContactRequest;
import com.appaamma.pickles.api.v1.contact.dto.ContactResponse;
import com.appaamma.pickles.common.ApiResponse;
import com.appaamma.pickles.common.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Contact", description = "Contact form submissions")
@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @Operation(summary = "Submit a contact form message")
    @PostMapping
    public ResponseEntity<ApiResponse<ContactResponse>> submit(@Valid @RequestBody ContactRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(contactService.submit(request), "Thank you! We'll get back to you soon."));
    }

    @Operation(summary = "[Admin] List contact messages")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ApiResponse<PageResponse<ContactResponse>> list(
            @RequestParam(required = false) Boolean handled,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        return ApiResponse.ok(contactService.list(handled, pageable));
    }

    @Operation(summary = "[Admin] Mark contact as handled/unhandled")
    @PatchMapping("/{id}/handled")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ApiResponse<ContactResponse> markHandled(@PathVariable Long id, @RequestParam(defaultValue = "true") boolean handled) {
        return ApiResponse.ok(contactService.markHandled(id, handled), "Updated");
    }
}
