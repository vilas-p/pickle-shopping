package com.appaamma.pickles.api.v1.admin.media;

import com.appaamma.pickles.common.ApiResponse;
import com.appaamma.pickles.domain.media.MediaCategory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "Admin Media", description = "Admin media management endpoints")
@RestController
@RequestMapping("/api/v1/admin/media")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @Operation(summary = "[Admin] Upload media (banner, hero, about, logo, general)")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MediaResponse>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("category") MediaCategory category,
            @RequestParam(value = "productId", required = false) Long productId,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @AuthenticationPrincipal UserDetails principal
    ) {
        Long uploadedBy = null; // Could extract user ID from principal if needed
        MediaResponse response = mediaService.upload(file, category, productId, altText, displayOrder, uploadedBy);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Media uploaded successfully"));
    }

    @Operation(summary = "[Admin] List all media, optionally filtered by category")
    @GetMapping
    public ApiResponse<List<MediaResponse>> list(@RequestParam(value = "category", required = false) MediaCategory category) {
        if (category != null) {
            return ApiResponse.ok(mediaService.listByCategory(category));
        }
        return ApiResponse.ok(mediaService.listAll());
    }

    @Operation(summary = "[Admin] Get media by ID")
    @GetMapping("/{id}")
    public ApiResponse<MediaResponse> getById(@PathVariable("id") Long id) {
        return ApiResponse.ok(mediaService.getById(id));
    }

    @Operation(summary = "[Admin] Update media metadata")
    @PutMapping("/{id}")
    public ApiResponse<MediaResponse> update(@PathVariable("id") Long id, @RequestBody MediaUpdateRequest request) {
        return ApiResponse.ok(mediaService.update(id, request), "Media updated");
    }

    @Operation(summary = "[Admin] Delete media (removes from S3 and database)")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        mediaService.delete(id);
        return ApiResponse.ok(null, "Media deleted");
    }
}
