package com.appaamma.pickles.api.v1.admin.upload;

import com.appaamma.pickles.config.S3StorageProperties;
import com.appaamma.pickles.service.storage.S3StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Delegates to the general S3StorageService. Kept for backward compatibility with existing upload endpoint.
 */
@Service
@RequiredArgsConstructor
public class ProductMediaStorageService {

    private final S3StorageService s3StorageService;
    private final S3StorageProperties storageProperties;

    public ProductMediaUploadResponse uploadProductMedia(MultipartFile file, String productSlug) {
        S3StorageService.UploadResult result = s3StorageService.upload(
                file, storageProperties.normalizedProductPrefix(), productSlug);
        return new ProductMediaUploadResponse(
                result.key(), result.url(), result.mediaType(), result.contentType(), result.size()
        );
    }
}