package com.appaamma.pickles.api.v1.product;

import com.appaamma.pickles.api.v1.product.dto.ProductRequest;
import com.appaamma.pickles.api.v1.product.dto.ProductResponse;
import com.appaamma.pickles.common.PageResponse;
import com.appaamma.pickles.domain.product.*;
import com.appaamma.pickles.exception.DuplicateResourceException;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> search(String search, String categorySlug, Boolean featured, Pageable pageable) {
        Specification<Product> spec = Specification.where(ProductSpecifications.isActive())
                .and(ProductSpecifications.nameContains(search))
                .and(ProductSpecifications.hasCategorySlug(categorySlug))
                .and(ProductSpecifications.isFeatured(featured));
        Page<Product> page = productRepository.findAll(spec, pageable);
        return PageResponse.map(page, productMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findFeatured() {
        return productMapper.toResponseList(productRepository.findFeatured());
    }

    @Transactional(readOnly = true)
    public ProductResponse getBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> findAllAdmin(Pageable pageable) {
        return PageResponse.map(productRepository.findAll(pageable), productMapper::toResponse);
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (productRepository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException("Product slug already exists: " + request.slug());
        }
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId()));

        Product product = Product.builder()
                .name(request.name())
                .slug(request.slug())
                .shortDescription(request.shortDescription())
                .description(request.description())
                .ingredients(request.ingredients())
                .shelfLife(request.shelfLife())
                .price(request.price())
                .compareAtPrice(request.compareAtPrice())
                .weight(request.weight())
                .category(category)
                .active(request.active())
                .featured(request.featured())
                .images(new ArrayList<>())
                .variants(new ArrayList<>())
                .build();

        applyImages(product, request);
        syncVariants(product, request.variants());
        return productMapper.toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (!product.getSlug().equals(request.slug()) && productRepository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException("Product slug already exists: " + request.slug());
        }

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId()));

        product.setName(request.name());
        product.setSlug(request.slug());
        product.setShortDescription(request.shortDescription());
        product.setDescription(request.description());
        product.setIngredients(request.ingredients());
        product.setShelfLife(request.shelfLife());
        product.setPrice(request.price());
        product.setCompareAtPrice(request.compareAtPrice());
        product.setWeight(request.weight());
        product.setCategory(category);
        product.setActive(request.active());
        product.setFeatured(request.featured());

        product.getImages().clear();
        applyImages(product, request);
        syncVariants(product, request.variants());

        return productMapper.toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", "id", id);
        }
        productRepository.deleteById(id);
    }

    private void applyImages(Product product, ProductRequest request) {
        if (request.images() == null || request.images().isEmpty()) return;
        for (var img : request.images()) {
            ProductImage image = ProductImage.builder()
                    .url(img.url())
                    .altText(StringUtils.hasText(img.altText()) ? img.altText() : product.getName())
                    .displayOrder(img.displayOrder() != null ? img.displayOrder() : 0)
                    .primary(img.primary())
                    .mediaType(img.mediaType() != null ? img.mediaType() : ProductMediaType.IMAGE)
                    .build();
            product.addImage(image);
        }
    }

    // Reconciles the managed variants collection: updates existing rows by id, adds new ones, removes the rest.
    private void syncVariants(Product product, List<ProductRequest.ProductVariantRequest> variantRequests) {
        if (variantRequests == null) return;

        Map<Long, ProductVariant> existingById = product.getVariants().stream()
                .filter(v -> v.getId() != null)
                .collect(Collectors.toMap(ProductVariant::getId, v -> v));

        List<ProductVariant> next = new ArrayList<>();
        int order = 0;
        for (var req : variantRequests) {
            ProductVariant variant = req.id() != null ? existingById.get(req.id()) : null;
            if (variant == null) {
                variant = new ProductVariant();
            }
            variant.setProduct(product);
            variant.setWeight(req.weight());
            variant.setSku(StringUtils.hasText(req.sku()) ? req.sku() : null);
            variant.setPrice(req.price());
            variant.setCompareAtPrice(req.compareAtPrice());
            variant.setDisplayOrder(req.displayOrder() != null ? req.displayOrder() : order);
            variant.setActive(req.active());
            next.add(variant);
            order++;
        }

        product.getVariants().clear();
        product.getVariants().addAll(next);
    }
}
