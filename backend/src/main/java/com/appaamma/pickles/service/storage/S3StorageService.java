package com.appaamma.pickles.service.storage;

import com.appaamma.pickles.config.S3StorageProperties;
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
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3StorageService {

    private static final Set<String> IMAGE_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"
    );
    private static final Set<String> VIDEO_CONTENT_TYPES = Set.of(
            "video/mp4", "video/webm", "video/quicktime", "video/ogg"
    );

    private final S3StorageProperties storageProperties;

    public UploadResult upload(MultipartFile file, String prefix, String slug) {
        validateConfigured();
        validateFile(file);

        String contentType = normalizeContentType(file.getContentType());
        ProductMediaType mediaType = resolveMediaType(contentType);
        String objectKey = buildObjectKey(prefix, slug, file.getOriginalFilename());

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(storageProperties.bucket())
                .key(objectKey)
                .contentType(contentType)
                .build();

        try (S3Client client = buildClient()) {
            client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read uploaded file.", ex);
        }

        log.info("Uploaded {} to s3://{}/{}", file.getOriginalFilename(), storageProperties.bucket(), objectKey);

        return new UploadResult(
                objectKey,
                buildPublicUrl(objectKey),
                mediaType,
                contentType,
                file.getSize(),
                file.getOriginalFilename()
        );
    }

    public void delete(String s3Key) {
        validateConfigured();
        if (!StringUtils.hasText(s3Key)) return;

        try (S3Client client = buildClient()) {
            client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(storageProperties.bucket())
                    .key(s3Key)
                    .build());
            log.info("Deleted s3://{}/{}", storageProperties.bucket(), s3Key);
        }
    }

    public boolean exists(String s3Key) {
        validateConfigured();
        try (S3Client client = buildClient()) {
            client.headObject(HeadObjectRequest.builder()
                    .bucket(storageProperties.bucket())
                    .key(s3Key)
                    .build());
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        }
    }

    public String getUrl(String s3Key) {
        return buildPublicUrl(s3Key);
    }

    public ProductMediaType resolveMediaType(String contentType) {
        if (IMAGE_CONTENT_TYPES.contains(contentType)) return ProductMediaType.IMAGE;
        if (VIDEO_CONTENT_TYPES.contains(contentType)) return ProductMediaType.VIDEO;
        throw new IllegalArgumentException("Unsupported media type: " + contentType + ". Only images and videos are allowed.");
    }

    private void validateConfigured() {
        if (!storageProperties.isConfigured()) {
            throw new IllegalStateException("S3 storage is not configured.");
        }
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

    private S3Client buildClient() {
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(storageProperties.region()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(storageProperties.accessKey(), storageProperties.secretKey())
                ));
        if (StringUtils.hasText(storageProperties.endpointUrl())) {
            builder.endpointOverride(URI.create(storageProperties.endpointUrl().trim()));
        }
        return builder.build();
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

    private String buildPublicUrl(String objectKey) {
        if (StringUtils.hasText(storageProperties.publicBaseUrl())) {
            return storageProperties.publicBaseUrl().replaceAll("/+$", "") + "/" + objectKey;
        }
        return "https://%s.s3.%s.amazonaws.com/%s".formatted(
                storageProperties.bucket(), storageProperties.region(), objectKey);
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
}
