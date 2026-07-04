package com.appaamma.pickles.api.v1.notification;

import com.appaamma.pickles.config.NotificationProperties;
import com.appaamma.pickles.domain.notification.*;
import com.appaamma.pickles.exception.BadRequestException;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationTemplateRepository templateRepository;
    private final NotificationLogRepository notificationLogRepository;
    private final SmsQueueRepository smsQueueRepository;
    private final WhatsAppQueueRepository whatsAppQueueRepository;
    private final EmailQueueRepository emailQueueRepository;
    private final NotificationTemplateEngine templateEngine;
    private final NotificationQueueProcessor queueProcessor;
    private final NotificationProperties properties;
    private final ObjectMapper objectMapper;

    @Transactional
    public NotificationLog sendSms(String templateCode, String phoneNumber, Map<String, Object> variables) {
        validateRecipient(phoneNumber, "phone number");
        NotificationTemplate template = getTemplate(templateCode, NotificationChannel.SMS);
        RenderedTemplate rendered = templateEngine.render(template, variables);
        NotificationLog log = saveLog(template, phoneNumber, variables, rendered);
        SmsQueue queue = new SmsQueue();
        populateQueue(queue, log, templateCode, phoneNumber, rendered.subject(), rendered.body(), variables);
        smsQueueRepository.save(queue);
        dispatchAfterCommit(() -> queueProcessor.dispatchSms(queue.getId()));
        return log;
    }

    @Transactional
    public NotificationLog sendWhatsApp(String templateCode, String phoneNumber, Map<String, Object> variables) {
        validateRecipient(phoneNumber, "phone number");
        NotificationTemplate template = getTemplate(templateCode, NotificationChannel.WHATSAPP);
        RenderedTemplate rendered = templateEngine.render(template, variables);
        NotificationLog log = saveLog(template, phoneNumber, variables, rendered);
        WhatsAppQueue queue = new WhatsAppQueue();
        populateQueue(queue, log, templateCode, phoneNumber, rendered.subject(), rendered.body(), variables);
        whatsAppQueueRepository.save(queue);
        dispatchAfterCommit(() -> queueProcessor.dispatchWhatsApp(queue.getId()));
        return log;
    }

    @Transactional
    public NotificationLog sendEmail(String templateCode, String emailAddress, Map<String, Object> variables) {
        validateRecipient(emailAddress, "email address");
        NotificationTemplate template = getTemplate(templateCode, NotificationChannel.EMAIL);
        RenderedTemplate rendered = templateEngine.render(template, variables);
        NotificationLog log = saveLog(template, emailAddress, variables, rendered);
        EmailQueue queue = new EmailQueue();
        populateQueue(queue, log, templateCode, emailAddress, rendered.subject(), rendered.body(), variables);
        emailQueueRepository.save(queue);
        dispatchAfterCommit(() -> queueProcessor.dispatchEmail(queue.getId()));
        return log;
    }

    private NotificationTemplate getTemplate(String templateCode, NotificationChannel expectedChannel) {
        NotificationTemplate template = templateRepository.findByTemplateCodeAndActiveTrue(templateCode)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationTemplate", "templateCode", templateCode));
        if (template.getChannel() != expectedChannel) {
            throw new BadRequestException("Template " + templateCode + " is not configured for channel " + expectedChannel);
        }
        return template;
    }

    private NotificationLog saveLog(NotificationTemplate template,
                                    String recipient,
                                    Map<String, Object> variables,
                                    RenderedTemplate rendered) {
        NotificationLog log = NotificationLog.builder()
                .templateCode(template.getTemplateCode())
                .channel(template.getChannel())
                .recipient(recipient)
                .subject(rendered.subject())
                .requestPayload(writeJson(variables))
                .renderedMessage(rendered.body())
                .status(NotificationDispatchStatus.QUEUED)
                .build();
        return notificationLogRepository.save(log);
    }

    private void populateQueue(NotificationQueueEntry queue,
                               NotificationLog log,
                               String templateCode,
                               String recipient,
                               String subject,
                               String body,
                               Map<String, Object> variables) {
        queue.setNotificationLog(log);
        queue.setTemplateCode(templateCode);
        queue.setRecipient(recipient);
        queue.setSubject(subject);
        queue.setRequestPayload(writeJson(variables));
        queue.setRenderedMessage(body);
        queue.setStatus(NotificationDispatchStatus.QUEUED);
        queue.setAttemptCount(0);
        queue.setMaxAttempts(properties.maxAttempts());
        queue.setNextAttemptAt(Instant.now());
    }

    private String writeJson(Map<String, Object> variables) {
        try {
            return objectMapper.writeValueAsString(variables);
        } catch (JsonProcessingException ex) {
            throw new BadRequestException("Could not serialise notification variables");
        }
    }

    private void validateRecipient(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Notification recipient " + label + " is required");
        }
    }

    private void dispatchAfterCommit(Runnable task) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            task.run();
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                task.run();
            }
        });
    }
}