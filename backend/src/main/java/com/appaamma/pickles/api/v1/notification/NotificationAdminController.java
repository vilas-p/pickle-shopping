package com.appaamma.pickles.api.v1.notification;

import com.appaamma.pickles.api.v1.notification.dto.NotificationLogResponse;
import com.appaamma.pickles.api.v1.notification.dto.NotificationTemplateRequest;
import com.appaamma.pickles.api.v1.notification.dto.NotificationTemplateResponse;
import com.appaamma.pickles.common.ApiResponse;
import com.appaamma.pickles.common.PageResponse;
import com.appaamma.pickles.domain.notification.NotificationChannel;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Notifications", description = "[Admin] Notification template and log management")
@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
public class NotificationAdminController {

    private final NotificationAdminService notificationAdminService;

    @Operation(summary = "List notification templates")
    @GetMapping("/templates")
    public ApiResponse<PageResponse<NotificationTemplateResponse>> listTemplates(
            @PageableDefault(size = 20, sort = "templateCode") Pageable pageable
    ) {
        return ApiResponse.ok(notificationAdminService.listTemplates(pageable));
    }

    @Operation(summary = "Get notification template by code")
    @GetMapping("/templates/{templateCode}")
    public ApiResponse<NotificationTemplateResponse> getTemplate(@PathVariable String templateCode) {
        return ApiResponse.ok(notificationAdminService.getTemplate(templateCode));
    }

    @Operation(summary = "Create notification template")
    @PostMapping("/templates")
    public ApiResponse<NotificationTemplateResponse> createTemplate(
            @Valid @RequestBody NotificationTemplateRequest request
    ) {
        return ApiResponse.ok(notificationAdminService.createTemplate(request), "Template created");
    }

    @Operation(summary = "Update notification template")
    @PutMapping("/templates/{templateCode}")
    public ApiResponse<NotificationTemplateResponse> updateTemplate(
            @PathVariable String templateCode,
            @Valid @RequestBody NotificationTemplateRequest request
    ) {
        return ApiResponse.ok(notificationAdminService.updateTemplate(templateCode, request), "Template updated");
    }

    @Operation(summary = "List notification logs")
    @GetMapping("/logs")
    public ApiResponse<PageResponse<NotificationLogResponse>> listLogs(
            @RequestParam(required = false) NotificationChannel channel,
            @RequestParam(required = false) String templateCode,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        return ApiResponse.ok(notificationAdminService.listLogs(channel, templateCode, pageable));
    }
}