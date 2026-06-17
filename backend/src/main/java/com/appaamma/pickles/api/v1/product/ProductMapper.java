package com.appaamma.pickles.api.v1.product;

import com.appaamma.pickles.api.v1.product.dto.ProductImageResponse;
import com.appaamma.pickles.api.v1.product.dto.ProductResponse;
import com.appaamma.pickles.domain.product.Product;
import com.appaamma.pickles.domain.product.ProductImage;
import com.appaamma.pickles.domain.product.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper
public interface ProductMapper {

    @Mapping(target = "category", source = "category")
    ProductResponse toResponse(Product product);

    List<ProductResponse> toResponseList(List<Product> products);

    ProductImageResponse toImageResponse(ProductImage image);

    ProductResponse.VariantResponse toVariantResponse(ProductVariant variant);
}
