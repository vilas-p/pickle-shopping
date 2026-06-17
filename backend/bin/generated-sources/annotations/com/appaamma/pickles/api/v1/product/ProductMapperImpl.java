package com.appaamma.pickles.api.v1.product;

import com.appaamma.pickles.api.v1.product.dto.ProductImageResponse;
import com.appaamma.pickles.api.v1.product.dto.ProductResponse;
import com.appaamma.pickles.domain.product.Category;
import com.appaamma.pickles.domain.product.Product;
import com.appaamma.pickles.domain.product.ProductImage;
import com.appaamma.pickles.domain.product.ProductVariant;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-16T22:53:56+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public ProductResponse toResponse(Product product) {
        if ( product == null ) {
            return null;
        }

        ProductResponse.CategorySummary category = null;
        Long id = null;
        String name = null;
        String slug = null;
        String shortDescription = null;
        String description = null;
        String ingredients = null;
        String shelfLife = null;
        BigDecimal price = null;
        BigDecimal compareAtPrice = null;
        String weight = null;
        boolean active = false;
        boolean featured = false;
        List<ProductImageResponse> images = null;
        List<ProductResponse.VariantResponse> variants = null;

        category = categoryToCategorySummary( product.getCategory() );
        id = product.getId();
        name = product.getName();
        slug = product.getSlug();
        shortDescription = product.getShortDescription();
        description = product.getDescription();
        ingredients = product.getIngredients();
        shelfLife = product.getShelfLife();
        price = product.getPrice();
        compareAtPrice = product.getCompareAtPrice();
        weight = product.getWeight();
        active = product.isActive();
        featured = product.isFeatured();
        images = productImageListToProductImageResponseList( product.getImages() );
        variants = productVariantListToVariantResponseList( product.getVariants() );

        ProductResponse productResponse = new ProductResponse( id, name, slug, shortDescription, description, ingredients, shelfLife, price, compareAtPrice, weight, active, featured, category, images, variants );

        return productResponse;
    }

    @Override
    public List<ProductResponse> toResponseList(List<Product> products) {
        if ( products == null ) {
            return null;
        }

        List<ProductResponse> list = new ArrayList<ProductResponse>( products.size() );
        for ( Product product : products ) {
            list.add( toResponse( product ) );
        }

        return list;
    }

    @Override
    public ProductImageResponse toImageResponse(ProductImage image) {
        if ( image == null ) {
            return null;
        }

        Long id = null;
        String url = null;
        String altText = null;
        Integer displayOrder = null;
        boolean primary = false;

        id = image.getId();
        url = image.getUrl();
        altText = image.getAltText();
        displayOrder = image.getDisplayOrder();
        primary = image.isPrimary();

        ProductImageResponse productImageResponse = new ProductImageResponse( id, url, altText, displayOrder, primary );

        return productImageResponse;
    }

    @Override
    public ProductResponse.VariantResponse toVariantResponse(ProductVariant variant) {
        if ( variant == null ) {
            return null;
        }

        Long id = null;
        String weight = null;
        String sku = null;
        BigDecimal price = null;
        BigDecimal compareAtPrice = null;
        int displayOrder = 0;
        boolean active = false;

        id = variant.getId();
        weight = variant.getWeight();
        sku = variant.getSku();
        price = variant.getPrice();
        compareAtPrice = variant.getCompareAtPrice();
        if ( variant.getDisplayOrder() != null ) {
            displayOrder = variant.getDisplayOrder();
        }
        active = variant.isActive();

        ProductResponse.VariantResponse variantResponse = new ProductResponse.VariantResponse( id, weight, sku, price, compareAtPrice, displayOrder, active );

        return variantResponse;
    }

    protected ProductResponse.CategorySummary categoryToCategorySummary(Category category) {
        if ( category == null ) {
            return null;
        }

        Long id = null;
        String name = null;
        String slug = null;

        id = category.getId();
        name = category.getName();
        slug = category.getSlug();

        ProductResponse.CategorySummary categorySummary = new ProductResponse.CategorySummary( id, name, slug );

        return categorySummary;
    }

    protected List<ProductImageResponse> productImageListToProductImageResponseList(List<ProductImage> list) {
        if ( list == null ) {
            return null;
        }

        List<ProductImageResponse> list1 = new ArrayList<ProductImageResponse>( list.size() );
        for ( ProductImage productImage : list ) {
            list1.add( toImageResponse( productImage ) );
        }

        return list1;
    }

    protected List<ProductResponse.VariantResponse> productVariantListToVariantResponseList(List<ProductVariant> list) {
        if ( list == null ) {
            return null;
        }

        List<ProductResponse.VariantResponse> list1 = new ArrayList<ProductResponse.VariantResponse>( list.size() );
        for ( ProductVariant productVariant : list ) {
            list1.add( toVariantResponse( productVariant ) );
        }

        return list1;
    }
}
