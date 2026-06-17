package com.appaamma.pickles.api.v1.category;

import com.appaamma.pickles.api.v1.category.dto.CategoryRequest;
import com.appaamma.pickles.api.v1.category.dto.CategoryResponse;
import com.appaamma.pickles.domain.product.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper
public interface CategoryMapper {
    CategoryResponse toResponse(Category category);
    List<CategoryResponse> toResponseList(List<Category> categories);

    @Mapping(target = "id", ignore = true)
    Category toEntity(CategoryRequest request);

    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget Category entity, CategoryRequest request);
}
