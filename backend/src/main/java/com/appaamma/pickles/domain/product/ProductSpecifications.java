package com.appaamma.pickles.domain.product;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class ProductSpecifications {

    private ProductSpecifications() {}

    public static Specification<Product> isActive() {
        return (root, q, cb) -> cb.isTrue(root.get("active"));
    }

    public static Specification<Product> nameContains(String search) {
        if (!StringUtils.hasText(search)) return null;
        String like = "%" + search.toLowerCase() + "%";
        return (root, q, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), like),
                cb.like(cb.lower(root.get("shortDescription")), like)
        );
    }

    public static Specification<Product> hasCategorySlug(String slug) {
        if (!StringUtils.hasText(slug)) return null;
        return (root, q, cb) -> cb.equal(root.get("category").get("slug"), slug);
    }

    public static Specification<Product> isFeatured(Boolean featured) {
        if (featured == null) return null;
        return (root, q, cb) -> cb.equal(root.get("featured"), featured);
    }
}
