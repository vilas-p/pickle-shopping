package com.appaamma.pickles.api.v1.product;

import com.appaamma.pickles.api.v1.product.dto.ProductRequest;
import com.appaamma.pickles.api.v1.product.dto.ProductResponse;
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

@Tag(name = "Products", description = "Product catalog endpoints")
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "List active products with optional search & filtering")
    @GetMapping
    public ApiResponse<PageResponse<ProductResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean featured,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.ok(productService.search(search, category, featured, pageable));
    }

    @Operation(summary = "Get featured products for the homepage")
    @GetMapping("/featured")
    public ApiResponse<List<ProductResponse>> featured() {
        return ApiResponse.ok(productService.findFeatured());
    }

    @Operation(summary = "Get a product by SEO-friendly slug")
    @GetMapping("/slug/{slug}")
    public ApiResponse<ProductResponse> bySlug(@PathVariable String slug) {
        return ApiResponse.ok(productService.getBySlug(slug));
    }

    @Operation(summary = "[Admin] Get a product by id")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ApiResponse<ProductResponse> byId(@PathVariable Long id) {
        return ApiResponse.ok(productService.getById(id));
    }

    @Operation(summary = "[Admin] List all products including inactive")
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ApiResponse<PageResponse<ProductResponse>> listAdmin(@PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.ok(productService.findAllAdmin(pageable));
    }

    @Operation(summary = "[Admin] Create a product")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest request) {
        ProductResponse created = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(created, "Product created"));
    }

    @Operation(summary = "[Admin] Update a product")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ApiResponse.ok(productService.update(id, request), "Product updated");
    }

    @Operation(summary = "[Admin] Delete a product")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ApiResponse.ok(null, "Product deleted");
    }
}
