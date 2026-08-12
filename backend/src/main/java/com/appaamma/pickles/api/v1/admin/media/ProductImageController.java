package com.appaamma.pickles.api.v1.admin.media;

import com.appaamma.pickles.common.ApiResponse;
import com.appaamma.pickles.domain.product.*;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import com.appaamma.pickles.service.storage.S3StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "Admin Product Images", description = "Manage product images via S3")
@RestController
@RequestMapping("/api/v1/admin/products/{productId}/images")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class ProductImageController {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final S3StorageService s3StorageService;

    @Operation(summary = "[Admin] Upload image/video for a product")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<ApiResponse<ProductImageResponse>> upload(
            @PathVariable("productId") Long productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "primary", required = false, defaultValue = "false") boolean primary
    ) {
        Product product = findProduct(productId);
        S3StorageService.UploadResult result = s3StorageService.upload(
                file, "products", product.getSlug());

        int nextOrder = productImageRepository.countByProductId(productId);

        ProductImage image = ProductImage.builder()
                .url(result.url())
                .s3Key(result.key())
                .altText(altText != null ? altText : product.getName())
                .displayOrder(nextOrder)
                .primary(primary)
                .mediaType(result.mediaType())
                .build();
        product.addImage(image);
        productRepository.save(product);

        log.info("Product image uploaded: productId={}, s3Key={}", productId, result.key());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(toResponse(image), "Product image uploaded"));
    }

    @Operation(summary = "[Admin] List all images for a product")
    @GetMapping
    public ApiResponse<List<ProductImageResponse>> list(@PathVariable("productId") Long productId) {
        findProduct(productId);
        List<ProductImageResponse> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId)
                .stream().map(this::toResponse).toList();
        return ApiResponse.ok(images);
    }

    @Operation(summary = "[Admin] Delete a product image (S3 + DB)")
    @DeleteMapping("/{imageId}")
    @Transactional
    public ApiResponse<Void> delete(@PathVariable("productId") Long productId, @PathVariable("imageId") Long imageId) {
        ProductImage image = productImageRepository.findByIdAndProductId(imageId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductImage", "id", imageId));

        if (image.getS3Key() != null) {
            s3StorageService.delete(image.getS3Key());
        }
        productImageRepository.delete(image);
        log.info("Product image deleted: productId={}, imageId={}", productId, imageId);
        return ApiResponse.ok(null, "Product image deleted");
    }

    @Operation(summary = "[Admin] Set an image as the primary image for a product")
    @PutMapping("/{imageId}/primary")
    @Transactional
    public ApiResponse<ProductImageResponse> setPrimary(@PathVariable("productId") Long productId, @PathVariable("imageId") Long imageId) {
        List<ProductImage> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId);
        ProductImage target = null;
        for (ProductImage img : images) {
            if (img.getId().equals(imageId)) {
                img.setPrimary(true);
                target = img;
            } else {
                img.setPrimary(false);
            }
        }
        if (target == null) {
            throw new ResourceNotFoundException("ProductImage", "id", imageId);
        }
        productImageRepository.saveAll(images);
        return ApiResponse.ok(toResponse(target), "Primary image set");
    }

    @Operation(summary = "[Admin] Reorder product images")
    @PutMapping("/reorder")
    @Transactional
    public ApiResponse<List<ProductImageResponse>> reorder(
            @PathVariable("productId") Long productId,
            @RequestBody List<Long> imageIds
    ) {
        findProduct(productId);
        List<ProductImage> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId);

        for (int i = 0; i < imageIds.size(); i++) {
            Long targetId = imageIds.get(i);
            for (ProductImage img : images) {
                if (img.getId().equals(targetId)) {
                    img.setDisplayOrder(i);
                    break;
                }
            }
        }
        productImageRepository.saveAll(images);
        List<ProductImageResponse> result = images.stream()
                .sorted((a, b) -> Integer.compare(a.getDisplayOrder(), b.getDisplayOrder()))
                .map(this::toResponse).toList();
        return ApiResponse.ok(result, "Images reordered");
    }

    private Product findProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
    }

    private ProductImageResponse toResponse(ProductImage img) {
        return new ProductImageResponse(
                img.getId(), img.getUrl(), img.getS3Key(), img.getAltText(),
                img.getDisplayOrder(), img.isPrimary(), img.getMediaType(), img.getCreatedAt()
        );
    }
}
