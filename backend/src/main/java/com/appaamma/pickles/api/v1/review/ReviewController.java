package com.appaamma.pickles.api.v1.review;

import com.appaamma.pickles.api.v1.review.dto.ReviewRequest;
import com.appaamma.pickles.api.v1.review.dto.ReviewResponse;
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

import java.util.List;

@Tag(name = "Reviews", description = "Customer reviews")
@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @Operation(summary = "Submit a customer review (requires admin approval)")
    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> create(@Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(reviewService.create(request),
                        "Thank you! Your review will be visible after moderation."));
    }

    @Operation(summary = "List approved reviews")
    @GetMapping
    public ApiResponse<PageResponse<ReviewResponse>> list(@PageableDefault(size = 12) Pageable pageable) {
        return ApiResponse.ok(reviewService.listApproved(pageable));
    }

    @Operation(summary = "Latest approved reviews (for homepage)")
    @GetMapping("/latest")
    public ApiResponse<List<ReviewResponse>> latest() {
        return ApiResponse.ok(reviewService.latestApproved());
    }

    @Operation(summary = "Approved reviews for a product")
    @GetMapping("/product/{productId}")
    public ApiResponse<PageResponse<ReviewResponse>> forProduct(
            @PathVariable Long productId, @PageableDefault(size = 10) Pageable pageable
    ) {
        return ApiResponse.ok(reviewService.listForProduct(productId, pageable));
    }

    @Operation(summary = "[Admin] List all reviews")
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ApiResponse<PageResponse<ReviewResponse>> listAdmin(
            @RequestParam(required = false) Boolean approved,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.ok(reviewService.listAdmin(approved, pageable));
    }

    @Operation(summary = "[Admin] Approve / unapprove a review")
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ApiResponse<ReviewResponse> approve(@PathVariable Long id, @RequestParam(defaultValue = "true") boolean approved) {
        return ApiResponse.ok(reviewService.approve(id, approved), "Updated");
    }

    @Operation(summary = "[Admin] Delete a review")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        reviewService.delete(id);
        return ApiResponse.ok(null, "Deleted");
    }
}
