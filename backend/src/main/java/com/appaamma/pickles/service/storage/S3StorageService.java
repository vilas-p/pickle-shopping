package com.appaamma.pickles.service.storage;

import com.appaamma.pickles.config.S3StorageProperties;
import com.appaamma.pickles.domain.credential.CredService;
import com.appaamma.pickles.domain.product.ProductMediaType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3StorageService {

    private static final String STORAGE_PROVIDER_CODE = "S3";
    private static final String BUCKET_KEY = "bucket";
    private static final String REGION_KEY = "region";
    private static final String ACCESS_KEY = "access_key";
    private static final String SECRET_KEY = "secret_key";
    private static final String ENDPOINT_URL_KEY = "endpoint_url";
    private static final String PUBLIC_BASE_URL_KEY = "public_base_url";

    private static final Set<String> IMAGE_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"
    );
    private static final Set<String> VIDEO_CONTENT_TYPES = Set.of(
            "video/mp4", "video/webm", "video/quicktime", "video/ogg"
    );

    private final S3StorageProperties storageProperties;
    private final CredService credService;

    public UploadResult upload(MultipartFile file, String prefix, String slug) {
        StorageConfig storageConfig = getStorageConfig();
        validateFile(file);

        String contentType = normalizeContentType(file.getContentType());
        ProductMediaType mediaType = resolveMediaType(contentType);
        String objectKey = buildObjectKey(prefix, slug, file.getOriginalFilename());

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(storageConfig.bucket())
                .key(objectKey)
                .contentType(contentType)
                .build();

        try (S3Client client = buildClient(storageConfig)) {
            client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read uploaded file.", ex);
        }

        log.info("Uploaded {} to s3://{}/{}", file.getOriginalFilename(), storageConfig.bucket(), objectKey);

        return new UploadResult(
                objectKey,
                buildPublicUrl(storageConfig, objectKey),
                mediaType,
                contentType,
                file.getSize(),
                file.getOriginalFilename()
        );
    }

    public void delete(String s3Key) {
        StorageConfig storageConfig = getStorageConfig();
        if (!StringUtils.hasText(s3Key)) return;

        try (S3Client client = buildClient(storageConfig)) {
            client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(storageConfig.bucket())
                    .key(s3Key)
                    .build());
            log.info("Deleted s3://{}/{}", storageConfig.bucket(), s3Key);
        }
    }

    public boolean exists(String s3Key) {
        StorageConfig storageConfig = getStorageConfig();
        try (S3Client client = buildClient(storageConfig)) {
            client.headObject(HeadObjectRequest.builder()
                    .bucket(storageConfig.bucket())
                    .key(s3Key)
                    .build());
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        }
    }

    public String getUrl(String s3Key) {
        return buildPublicUrl(getStorageConfig(), s3Key);
    }

    public ProductMediaType resolveMediaType(String contentType) {
        if (IMAGE_CONTENT_TYPES.contains(contentType)) return ProductMediaType.IMAGE;
        if (VIDEO_CONTENT_TYPES.contains(contentType)) return ProductMediaType.VIDEO;
        throw new IllegalArgumentException("Unsupported media type: " + contentType + ". Only images and videos are allowed.");
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select a file to upload.");
        }
        if (file.getSize() > storageProperties.maxFileSizeBytes()) {
            throw new IllegalArgumentException("File exceeds the maximum upload size of %d MB."
                    .formatted(storageProperties.maxFileSizeBytes() / (1024 * 1024)));
        }
        String contentType = normalizeContentType(file.getContentType());
        if (!IMAGE_CONTENT_TYPES.contains(contentType) && !VIDEO_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Unsupported file type: " + contentType);
        }
    }

    private S3Client buildClient(StorageConfig storageConfig) {
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(storageConfig.region()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(storageConfig.accessKey(), storageConfig.secretKey())
                ));
        if (StringUtils.hasText(storageConfig.endpointUrl())) {
            builder.endpointOverride(URI.create(storageConfig.endpointUrl().trim()));
        }
        return builder.build();
    }

    private StorageConfig getStorageConfig() {
        Map<String, String> entries = credService.getActiveCredentialEntriesByProviderCode(STORAGE_PROVIDER_CODE);
        return new StorageConfig(
                requireCredential(entries, BUCKET_KEY),
                requireCredential(entries, REGION_KEY),
                requireCredential(entries, ACCESS_KEY),
                requireCredential(entries, SECRET_KEY),
                optionalCredential(entries, ENDPOINT_URL_KEY),
                optionalCredential(entries, PUBLIC_BASE_URL_KEY)
        );
    }

    private String requireCredential(Map<String, String> entries, String key) {
        String value = entries.get(key);
        if (StringUtils.hasText(value)) {
            return value.trim();
        }
        throw new IllegalStateException(
                "Missing S3 credential in database for provider " + STORAGE_PROVIDER_CODE + ": " + key
        );
    }

    private String optionalCredential(Map<String, String> entries, String key) {
        String value = entries.get(key);
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String normalizeContentType(String contentType) {
        if (!StringUtils.hasText(contentType)) {
            throw new IllegalArgumentException("Uploaded file must include a content type.");
        }
        return contentType.toLowerCase(Locale.ROOT);
    }

    private String buildObjectKey(String prefix, String slug, String originalFilename) {
        String safeSlug = sanitizeSlug(slug);
        String extension = extensionOf(originalFilename);

        StringBuilder key = new StringBuilder(normalizePrefix(prefix)).append('/');
        if (StringUtils.hasText(safeSlug)) {
            key.append(safeSlug).append('/');
        }
        key.append(UUID.randomUUID());
        if (StringUtils.hasText(extension)) {
            key.append('.').append(extension);
        }
        return key.toString();
    }

    private String buildPublicUrl(StorageConfig storageConfig, String objectKey) {
        if (StringUtils.hasText(storageConfig.publicBaseUrl())) {
            return storageConfig.publicBaseUrl().replaceAll("/+$", "") + "/" + objectKey;
        }
        return "https://%s.s3.%s.amazonaws.com/%s".formatted(
                storageConfig.bucket(), storageConfig.region(), objectKey);
    }

    private String normalizePrefix(String prefix) {
        if (!StringUtils.hasText(prefix)) return "general";
        String normalized = prefix.trim().toLowerCase(Locale.ROOT);
        while (normalized.startsWith("/")) normalized = normalized.substring(1);
        while (normalized.endsWith("/")) normalized = normalized.substring(0, normalized.length() - 1);
        return normalized;
    }

    private String sanitizeSlug(String slug) {
        if (!StringUtils.hasText(slug)) return "";
        return slug.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9-]", "-").replaceAll("-+", "-");
    }

    private String extensionOf(String originalFilename) {
        if (!StringUtils.hasText(originalFilename) || !originalFilename.contains(".")) return "";
        String ext = originalFilename.substring(originalFilename.lastIndexOf('.') + 1)
                .toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        return ext.length() > 10 ? ext.substring(0, 10) : ext;
    }

    public record UploadResult(
            String key,
            String url,
            ProductMediaType mediaType,
            String contentType,
            long size,
            String originalFilename
    ) {}

        private record StorageConfig(
            String bucket,
            String region,
            String accessKey,
            String secretKey,
            String endpointUrl,
            String publicBaseUrl
        ) {}
}
