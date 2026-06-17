package com.appaamma.pickles.api.v1.review;

import com.appaamma.pickles.api.v1.review.dto.ReviewResponse;
import com.appaamma.pickles.domain.review.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface ReviewMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    ReviewResponse toResponse(Review review);
}
