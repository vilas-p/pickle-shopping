package com.appaamma.pickles.api.v1.admin.upload;

import com.appaamma.pickles.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Admin Uploads", description = "Admin product media upload endpoints")
@RestController
@RequestMapping("/api/v1/admin/uploads")
@RequiredArgsConstructor
public class ProductMediaUploadController {

    private final ProductMediaStorageService productMediaStorageService;

    @Operation(summary = "[Admin] Upload a product image or video to S3")
    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductMediaUploadResponse>> uploadProductMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "productSlug", required = false) String productSlug
    ) {
        ProductMediaUploadResponse response = productMediaStorageService.uploadProductMedia(file, productSlug);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Product media uploaded"));
    }
}