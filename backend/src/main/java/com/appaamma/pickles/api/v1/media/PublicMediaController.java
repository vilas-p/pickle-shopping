package com.appaamma.pickles.api.v1.media;

import com.appaamma.pickles.api.v1.admin.media.MediaResponse;
import com.appaamma.pickles.api.v1.admin.media.MediaService;
import com.appaamma.pickles.common.ApiResponse;
import com.appaamma.pickles.domain.media.MediaCategory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Public Media", description = "Public media endpoints for the storefront")
@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
public class PublicMediaController {

    private final MediaService mediaService;

    @Operation(summary = "Get active banner media")
    @GetMapping("/banners")
    public ApiResponse<List<MediaResponse>> banners() {
        return ApiResponse.ok(mediaService.listActiveByCategory(MediaCategory.BANNER));
    }

    @Operation(summary = "Get active site media by category")
    @GetMapping("/site")
    public ApiResponse<List<MediaResponse>> site(@RequestParam("category") MediaCategory category) {
        return ApiResponse.ok(mediaService.listActiveByCategory(category));
    }
}
