package com.appaamma.pickles.api.v1.category;

import com.appaamma.pickles.api.v1.category.dto.CategoryRequest;
import com.appaamma.pickles.api.v1.category.dto.CategoryResponse;
import com.appaamma.pickles.domain.product.Category;
import com.appaamma.pickles.domain.product.CategoryRepository;
import com.appaamma.pickles.exception.DuplicateResourceException;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAllActive() {
        return categoryMapper.toResponseList(categoryRepository.findAllByActiveTrueOrderByNameAsc());
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categoryMapper.toResponseList(categoryRepository.findAll());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .map(categoryMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException("Category slug already exists: " + request.slug());
        }
        Category category = categoryMapper.toEntity(request);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        if (!category.getSlug().equals(request.slug()) && categoryRepository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException("Category slug already exists: " + request.slug());
        }
        categoryMapper.update(category, request);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category", "id", id);
        }
        categoryRepository.deleteById(id);
    }
}
