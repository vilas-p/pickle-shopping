package com.appaamma.pickles.api.v1.review;

import com.appaamma.pickles.api.v1.review.dto.ReviewRequest;
import com.appaamma.pickles.api.v1.review.dto.ReviewResponse;
import com.appaamma.pickles.common.PageResponse;
import com.appaamma.pickles.domain.product.Product;
import com.appaamma.pickles.domain.product.ProductRepository;
import com.appaamma.pickles.domain.review.Review;
import com.appaamma.pickles.domain.review.ReviewRepository;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final ReviewMapper reviewMapper;

    @Transactional
    public ReviewResponse create(ReviewRequest request) {
        Product product = null;
        if (request.productId() != null) {
            product = productRepository.findById(request.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.productId()));
        }
        Review review = Review.builder()
                .product(product)
                .authorName(request.authorName())
                .authorCity(request.authorCity())
                .rating(request.rating())
                .title(request.title())
                .body(request.body())
                .approved(false)
                .build();
        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> listApproved(Pageable pageable) {
        Page<Review> page = reviewRepository.findAllByApprovedTrueOrderByCreatedAtDesc(pageable);
        return PageResponse.map(page, reviewMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> latestApproved() {
        return reviewRepository.findTop6ByApprovedTrueOrderByCreatedAtDesc()
                .stream().map(reviewMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> listForProduct(Long productId, Pageable pageable) {
        return PageResponse.map(
                reviewRepository.findAllByProductIdAndApprovedTrue(productId, pageable),
                reviewMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> listAdmin(Boolean approved, Pageable pageable) {
        Page<Review> page = (approved == null)
                ? reviewRepository.findAll(pageable)
                : reviewRepository.findAllByApproved(approved, pageable);
        return PageResponse.map(page, reviewMapper::toResponse);
    }

    @Transactional
    public ReviewResponse approve(Long id, boolean approved) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        review.setApproved(approved);
        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    @Transactional
    public void delete(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Review", "id", id);
        }
        reviewRepository.deleteById(id);
    }
}
