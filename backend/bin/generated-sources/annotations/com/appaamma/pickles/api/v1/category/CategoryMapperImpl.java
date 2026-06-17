package com.appaamma.pickles.api.v1.category;

import com.appaamma.pickles.api.v1.category.dto.CategoryRequest;
import com.appaamma.pickles.api.v1.category.dto.CategoryResponse;
import com.appaamma.pickles.domain.product.Category;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-16T22:46:21+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class CategoryMapperImpl implements CategoryMapper {

    @Override
    public CategoryResponse toResponse(Category category) {
        if ( category == null ) {
            return null;
        }

        Long id = null;
        String name = null;
        String slug = null;
        String description = null;
        boolean active = false;

        id = category.getId();
        name = category.getName();
        slug = category.getSlug();
        description = category.getDescription();
        active = category.isActive();

        CategoryResponse categoryResponse = new CategoryResponse( id, name, slug, description, active );

        return categoryResponse;
    }

    @Override
    public List<CategoryResponse> toResponseList(List<Category> categories) {
        if ( categories == null ) {
            return null;
        }

        List<CategoryResponse> list = new ArrayList<CategoryResponse>( categories.size() );
        for ( Category category : categories ) {
            list.add( toResponse( category ) );
        }

        return list;
    }

    @Override
    public Category toEntity(CategoryRequest request) {
        if ( request == null ) {
            return null;
        }

        Category.CategoryBuilder category = Category.builder();

        category.name( request.name() );
        category.slug( request.slug() );
        category.description( request.description() );
        category.active( request.active() );

        return category.build();
    }

    @Override
    public void update(Category entity, CategoryRequest request) {
        if ( request == null ) {
            return;
        }

        entity.setName( request.name() );
        entity.setSlug( request.slug() );
        entity.setDescription( request.description() );
        entity.setActive( request.active() );
    }
}
