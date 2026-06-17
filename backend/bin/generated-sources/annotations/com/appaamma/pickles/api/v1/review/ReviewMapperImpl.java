package com.appaamma.pickles.api.v1.review;

import com.appaamma.pickles.api.v1.review.dto.ReviewResponse;
import com.appaamma.pickles.domain.product.Product;
import com.appaamma.pickles.domain.review.Review;
import java.time.Instant;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-16T22:46:21+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ReviewMapperImpl implements ReviewMapper {

    @Override
    public ReviewResponse toResponse(Review review) {
        if ( review == null ) {
            return null;
        }

        Long productId = null;
        String productName = null;
        Long id = null;
        String authorName = null;
        String authorCity = null;
        Integer rating = null;
        String title = null;
        String body = null;
        boolean approved = false;
        Instant createdAt = null;

        productId = reviewProductId( review );
        productName = reviewProductName( review );
        id = review.getId();
        authorName = review.getAuthorName();
        authorCity = review.getAuthorCity();
        rating = review.getRating();
        title = review.getTitle();
        body = review.getBody();
        approved = review.isApproved();
        createdAt = review.getCreatedAt();

        ReviewResponse reviewResponse = new ReviewResponse( id, productId, productName, authorName, authorCity, rating, title, body, approved, createdAt );

        return reviewResponse;
    }

    private Long reviewProductId(Review review) {
        Product product = review.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getId();
    }

    private String reviewProductName(Review review) {
        Product product = review.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getName();
    }
}
