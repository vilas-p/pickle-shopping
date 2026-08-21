package com.appaamma.pickles.domain.media;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MediaRepository extends JpaRepository<Media, Long> {

    List<Media> findByCategoryAndActiveOrderByDisplayOrderAsc(MediaCategory category, boolean active);

    List<Media> findByCategoryOrderByDisplayOrderAsc(MediaCategory category);

    List<Media> findByProductIdOrderByDisplayOrderAsc(Long productId);

    Optional<Media> findByS3Key(String s3Key);

    boolean existsByS3Key(String s3Key);
}
