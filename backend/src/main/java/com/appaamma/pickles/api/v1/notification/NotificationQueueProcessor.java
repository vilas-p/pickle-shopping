package com.appaamma.pickles.api.v1.notification;

import com.appaamma.pickles.api.v1.notification.provider.EmailProvider;
import com.appaamma.pickles.api.v1.notification.provider.NotificationProviderResponse;
import com.appaamma.pickles.api.v1.notification.provider.SmsProvider;
import com.appaamma.pickles.api.v1.notification.provider.WhatsAppProvider;
import com.appaamma.pickles.config.NotificationProperties;
import com.appaamma.pickles.domain.notification.*;
import com.appaamma.pickles.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationQueueProcessor {

    private static final List<NotificationDispatchStatus> RETRIABLE_STATUSES = List.of(
            NotificationDispatchStatus.QUEUED,
            NotificationDispatchStatus.FAILED
    );

    private final NotificationProperties properties;
    private final SmsQueueRepository smsQueueRepository;
    private final WhatsAppQueueRepository whatsAppQueueRepository;
    private final EmailQueueRepository emailQueueRepository;
    private final NotificationLogRepository notificationLogRepository;
    private final List<SmsProvider> smsProviders;
    private final List<WhatsAppProvider> whatsAppProviders;
    private final List<EmailProvider> emailProviders;
    private final ApplicationContext applicationContext;

    @Async("notificationExecutor")
    @Transactional
    public void dispatchSms(Long queueId) {
        processSms(queueId);
    }

    @Async("notificationExecutor")
    @Transactional
    public void dispatchWhatsApp(Long queueId) {
        processWhatsApp(queueId);
    }

    @Async("notificationExecutor")
    @Transactional
    public void dispatchEmail(Long queueId) {
        processEmail(queueId);
    }

    @Scheduled(fixedDelayString = "${app.notification.retry-scan-interval:60000}")
    public void retrySmsQueue() {
        NotificationQueueProcessor self = applicationContext.getBean(NotificationQueueProcessor.class);
        smsQueueRepository.findTop50ByStatusInAndNextAttemptAtBeforeOrderByCreatedAtAsc(RETRIABLE_STATUSES, Instant.now())
            .forEach(queue -> self.dispatchSms(queue.getId()));
    }

    @Scheduled(fixedDelayString = "${app.notification.retry-scan-interval:60000}")
    public void retryWhatsAppQueue() {
        NotificationQueueProcessor self = applicationContext.getBean(NotificationQueueProcessor.class);
        whatsAppQueueRepository.findTop50ByStatusInAndNextAttemptAtBeforeOrderByCreatedAtAsc(RETRIABLE_STATUSES, Instant.now())
            .forEach(queue -> self.dispatchWhatsApp(queue.getId()));
    }

    @Scheduled(fixedDelayString = "${app.notification.retry-scan-interval:60000}")
    public void retryEmailQueue() {
        NotificationQueueProcessor self = applicationContext.getBean(NotificationQueueProcessor.class);
        emailQueueRepository.findTop50ByStatusInAndNextAttemptAtBeforeOrderByCreatedAtAsc(RETRIABLE_STATUSES, Instant.now())
            .forEach(queue -> self.dispatchEmail(queue.getId()));
    }

    protected void processSms(Long queueId) {
        SmsQueue queue = smsQueueRepository.findById(queueId).orElse(null);
        if (queue == null) {
            return;
        }
        if (queue.getStatus() == NotificationDispatchStatus.SENT || queue.getStatus() == NotificationDispatchStatus.DEAD_LETTER) {
            return;
        }
        queue.setStatus(NotificationDispatchStatus.PROCESSING);
        NotificationProviderResponse response = null;
        try {
            response = resolveSmsProvider().send(queue.getRecipient(), queue.getRenderedMessage());
            markSuccess(queue, response);
        } catch (RuntimeException ex) {
            markFailure(queue, response, ex);
        }
    }

    protected void processWhatsApp(Long queueId) {
        WhatsAppQueue queue = whatsAppQueueRepository.findById(queueId).orElse(null);
        if (queue == null) {
            return;
        }
        if (queue.getStatus() == NotificationDispatchStatus.SENT || queue.getStatus() == NotificationDispatchStatus.DEAD_LETTER) {
            return;
        }
        queue.setStatus(NotificationDispatchStatus.PROCESSING);
        NotificationProviderResponse response = null;
        try {
            response = resolveWhatsAppProvider().send(queue.getRecipient(), queue.getRenderedMessage());
            markSuccess(queue, response);
        } catch (RuntimeException ex) {
            markFailure(queue, response, ex);
        }
    }

    protected void processEmail(Long queueId) {
        EmailQueue queue = emailQueueRepository.findById(queueId).orElse(null);
        if (queue == null) {
            return;
        }
        if (queue.getStatus() == NotificationDispatchStatus.SENT || queue.getStatus() == NotificationDispatchStatus.DEAD_LETTER) {
            return;
        }
        queue.setStatus(NotificationDispatchStatus.PROCESSING);
        NotificationProviderResponse response = null;
        try {
            response = resolveEmailProvider().send(queue.getRecipient(), queue.getSubject(), queue.getRenderedMessage());
            markSuccess(queue, response);
        } catch (RuntimeException ex) {
            markFailure(queue, response, ex);
        }
    }

    private void markSuccess(NotificationQueueEntry queue, NotificationProviderResponse response) {
        queue.setAttemptCount(queue.getAttemptCount() + 1);
        queue.setStatus(NotificationDispatchStatus.SENT);
        queue.setProviderName(response.providerName());
        queue.setProviderResponse(response.rawResponse());

        NotificationLog logEntry = queue.getNotificationLog();
        logEntry.setAttemptCount(queue.getAttemptCount());
        logEntry.setStatus(NotificationDispatchStatus.SENT);
        logEntry.setProviderName(response.providerName());
        logEntry.setProviderResponse(response.rawResponse());
        notificationLogRepository.save(logEntry);

        deleteQueueEntry(queue);
    }

    private void markFailure(NotificationQueueEntry queue,
                             NotificationProviderResponse response,
                             RuntimeException ex) {
        int nextAttempt = queue.getAttemptCount() + 1;
        queue.setAttemptCount(nextAttempt);
        queue.setProviderName(response != null ? response.providerName() : queue.getProviderName());
        queue.setProviderResponse(response != null ? response.rawResponse() : queue.getProviderResponse());
        queue.setFailureReason(ex.getMessage());
        if (nextAttempt >= queue.getMaxAttempts()) {
            queue.setStatus(NotificationDispatchStatus.DEAD_LETTER);
        } else {
            queue.setStatus(NotificationDispatchStatus.FAILED);
            queue.setNextAttemptAt(Instant.now().plus(properties.retryBackoff().multipliedBy(nextAttempt)));
        }

        NotificationLog logEntry = queue.getNotificationLog();
        logEntry.setAttemptCount(nextAttempt);
        logEntry.setStatus(queue.getStatus());
        logEntry.setProviderName(queue.getProviderName());
        logEntry.setProviderResponse(queue.getProviderResponse());
        logEntry.setFailureReason(ex.getMessage());
        notificationLogRepository.save(logEntry);

        if (queue.getStatus() == NotificationDispatchStatus.DEAD_LETTER) {
            deleteQueueEntry(queue);
            return;
        }

        saveQueueEntry(queue);
        log.warn("Notification dispatch failed for template {} to {}: {}", queue.getTemplateCode(), queue.getRecipient(), ex.getMessage());
    }

    private void saveQueueEntry(NotificationQueueEntry queue) {
        if (queue instanceof SmsQueue smsQueue) {
            smsQueueRepository.save(smsQueue);
            return;
        }
        if (queue instanceof WhatsAppQueue whatsAppQueue) {
            whatsAppQueueRepository.save(whatsAppQueue);
            return;
        }
        if (queue instanceof EmailQueue emailQueue) {
            emailQueueRepository.save(emailQueue);
        }
    }

    private void deleteQueueEntry(NotificationQueueEntry queue) {
        if (queue instanceof SmsQueue smsQueue) {
            smsQueueRepository.delete(smsQueue);
            return;
        }
        if (queue instanceof WhatsAppQueue whatsAppQueue) {
            whatsAppQueueRepository.delete(whatsAppQueue);
            return;
        }
        if (queue instanceof EmailQueue emailQueue) {
            emailQueueRepository.delete(emailQueue);
        }
    }

    private SmsProvider resolveSmsProvider() {
        return smsProviders.stream()
                .filter(provider -> provider.type() == properties.sms().provider())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No SMS provider configured for " + properties.sms().provider()));
    }

    private WhatsAppProvider resolveWhatsAppProvider() {
        return whatsAppProviders.stream()
                .filter(provider -> provider.type() == properties.whatsapp().provider())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No WhatsApp provider configured for " + properties.whatsapp().provider()));
    }

    private EmailProvider resolveEmailProvider() {
        return emailProviders.stream()
                .filter(provider -> provider.type() == properties.email().provider())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No Email provider configured for " + properties.email().provider()));
    }
}