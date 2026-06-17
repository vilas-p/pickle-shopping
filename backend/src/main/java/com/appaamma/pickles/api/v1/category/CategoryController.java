package com.appaamma.pickles.api.v1.category;

import com.appaamma.pickles.api.v1.category.dto.CategoryRequest;
import com.appaamma.pickles.api.v1.category.dto.CategoryResponse;
import com.appaamma.pickles.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Categories", description = "Product categories")
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "List active categories")
    @GetMapping
    public ApiResponse<List<CategoryResponse>> list() {
        return ApiResponse.ok(categoryService.findAllActive());
    }

    @Operation(summary = "[Admin] List all categories")
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ApiResponse<List<CategoryResponse>> listAll() {
        return ApiResponse.ok(categoryService.findAll());
    }

    @Operation(summary = "Get a category by slug")
    @GetMapping("/slug/{slug}")
    public ApiResponse<CategoryResponse> bySlug(@PathVariable String slug) {
        return ApiResponse.ok(categoryService.getBySlug(slug));
    }

    @Operation(summary = "[Admin] Create a category")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> create(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(categoryService.create(request), "Created"));
    }

    @Operation(summary = "[Admin] Update a category")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CategoryResponse> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ApiResponse.ok(categoryService.update(id, request), "Updated");
    }

    @Operation(summary = "[Admin] Delete a category")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ApiResponse.ok(null, "Deleted");
    }
}
