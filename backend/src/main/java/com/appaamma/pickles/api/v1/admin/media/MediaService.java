package com.appaamma.pickles.api.v1.admin.media;

import com.appaamma.pickles.domain.media.Media;
import com.appaamma.pickles.domain.media.MediaCategory;
import com.appaamma.pickles.domain.media.MediaRepository;
import com.appaamma.pickles.domain.product.Product;
import com.appaamma.pickles.domain.product.ProductRepository;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import com.appaamma.pickles.service.storage.S3StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MediaService {

    private final MediaRepository mediaRepository;
    private final ProductRepository productRepository;
    private final S3StorageService s3StorageService;

    @Transactional
    public MediaResponse upload(MultipartFile file, MediaCategory category, Long productId,
                                String altText, Integer displayOrder, Long uploadedBy) {
        String prefix = resolvePrefix(category);
        String slug = resolveSlug(category, productId);
        S3StorageService.UploadResult result = s3StorageService.upload(file, prefix, slug);

        Media media = Media.builder()
                .originalFilename(result.originalFilename())
                .s3Key(result.key())
                .url(result.url())
                .contentType(result.contentType())
                .mediaType(result.mediaType())
                .fileSize(result.size())
                .category(category)
                .productId(productId)
                .altText(altText)
                .displayOrder(displayOrder != null ? displayOrder : 0)
                .uploadedBy(uploadedBy)
                .build();

        media = mediaRepository.save(media);
        log.info("Media uploaded: id={}, category={}, key={}", media.getId(), category, result.key());
        return toResponse(media);
    }

    private String resolvePrefix(MediaCategory category) {
        return switch (category) {
            case BANNER -> "banners";
            case PRODUCT -> "products";
            default -> category.name().toLowerCase();
        };
    }

    private String resolveSlug(MediaCategory category, Long productId) {
        if (category != MediaCategory.PRODUCT || productId == null) {
            return null;
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        return product.getSlug();
    }

    @Transactional(readOnly = true)
    public List<MediaResponse> listByCategory(MediaCategory category) {
        return mediaRepository.findByCategoryOrderByDisplayOrderAsc(category)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MediaResponse> listActiveByCategory(MediaCategory category) {
        return mediaRepository.findByCategoryAndActiveOrderByDisplayOrderAsc(category, true)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MediaResponse> listAll() {
        return mediaRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MediaResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public MediaResponse update(Long id, MediaUpdateRequest request) {
        Media media = findById(id);
        if (request.altText() != null) media.setAltText(request.altText());
        if (request.displayOrder() != null) media.setDisplayOrder(request.displayOrder());
        if (request.active() != null) media.setActive(request.active());
        return toResponse(mediaRepository.save(media));
    }

    @Transactional
    public void delete(Long id) {
        Media media = findById(id);
        s3StorageService.delete(media.getS3Key());
        mediaRepository.delete(media);
        log.info("Media deleted: id={}, key={}", id, media.getS3Key());
    }

    private Media findById(Long id) {
        return mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media", "id", id));
    }

    private MediaResponse toResponse(Media m) {
        return new MediaResponse(
                m.getId(), m.getOriginalFilename(), m.getS3Key(), m.getUrl(),
                m.getContentType(), m.getMediaType(), m.getFileSize(),
                m.getCategory(), m.getProductId(), m.getAltText(),
                m.getDisplayOrder(), m.isActive(), m.getUploadedBy(),
                m.getCreatedAt(), m.getUpdatedAt()
        );
    }
}
