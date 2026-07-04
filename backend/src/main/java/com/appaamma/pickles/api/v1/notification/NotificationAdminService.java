package com.appaamma.pickles.api.v1.notification;

import com.appaamma.pickles.api.v1.notification.dto.NotificationLogResponse;
import com.appaamma.pickles.api.v1.notification.dto.NotificationTemplateRequest;
import com.appaamma.pickles.api.v1.notification.dto.NotificationTemplateResponse;
import com.appaamma.pickles.common.PageResponse;
import com.appaamma.pickles.domain.notification.NotificationChannel;
import com.appaamma.pickles.domain.notification.NotificationLog;
import com.appaamma.pickles.domain.notification.NotificationLogRepository;
import com.appaamma.pickles.domain.notification.NotificationTemplate;
import com.appaamma.pickles.domain.notification.NotificationTemplateRepository;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationAdminService {

    private final NotificationTemplateRepository templateRepository;
    private final NotificationLogRepository logRepository;

    @Transactional(readOnly = true)
    public PageResponse<NotificationTemplateResponse> listTemplates(Pageable pageable) {
        return PageResponse.map(templateRepository.findAll(pageable), this::toTemplateResponse);
    }

    @Transactional(readOnly = true)
    public NotificationTemplateResponse getTemplate(String templateCode) {
        NotificationTemplate template = templateRepository.findByTemplateCode(templateCode)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationTemplate", "templateCode", templateCode));
        return toTemplateResponse(template);
    }

    @Transactional
    public NotificationTemplateResponse createTemplate(NotificationTemplateRequest request) {
        NotificationTemplate template = new NotificationTemplate();
        apply(template, request);
        return toTemplateResponse(templateRepository.save(template));
    }

    @Transactional
    public NotificationTemplateResponse updateTemplate(String templateCode, NotificationTemplateRequest request) {
        NotificationTemplate template = templateRepository.findByTemplateCode(templateCode)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationTemplate", "templateCode", templateCode));
        apply(template, request);
        return toTemplateResponse(templateRepository.save(template));
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationLogResponse> listLogs(NotificationChannel channel,
                                                          String templateCode,
                                                          Pageable pageable) {
        Page<NotificationLog> page;
        if (templateCode != null && !templateCode.isBlank()) {
            page = logRepository.findAllByTemplateCode(templateCode, pageable);
        } else if (channel != null) {
            page = logRepository.findAllByChannel(channel, pageable);
        } else {
            page = logRepository.findAll(pageable);
        }
        return PageResponse.map(page, this::toLogResponse);
    }

    private void apply(NotificationTemplate template, NotificationTemplateRequest request) {
        template.setTemplateCode(request.templateCode().trim());
        template.setChannel(request.channel());
        template.setLocale(request.locale().trim());
        template.setSubjectTemplate(request.subjectTemplate());
        template.setBodyTemplate(request.bodyTemplate().trim());
        template.setDescription(request.description());
        template.setActive(request.active());
    }

    private NotificationTemplateResponse toTemplateResponse(NotificationTemplate template) {
        return new NotificationTemplateResponse(
                template.getId(),
                template.getTemplateCode(),
                template.getChannel(),
                template.getLocale(),
                template.getSubjectTemplate(),
                template.getBodyTemplate(),
                template.getDescription(),
                template.isActive(),
                template.getCreatedAt(),
                template.getUpdatedAt()
        );
    }

    private NotificationLogResponse toLogResponse(NotificationLog log) {
        return new NotificationLogResponse(
                log.getId(),
                log.getTemplateCode(),
                log.getChannel(),
                log.getRecipient(),
                log.getSubject(),
                log.getRenderedMessage(),
                log.getStatus(),
                log.getProviderName(),
                log.getProviderResponse(),
                log.getFailureReason(),
                log.getAttemptCount(),
                log.getCreatedAt()
        );
    }
}