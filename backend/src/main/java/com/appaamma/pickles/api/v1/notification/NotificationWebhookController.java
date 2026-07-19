package com.appaamma.pickles.api.v1.notification;

import com.appaamma.pickles.api.v1.notification.dto.Msg91WhatsAppWebhookPayload;
import com.appaamma.pickles.domain.notification.NotificationDispatchStatus;
import com.appaamma.pickles.domain.notification.NotificationLog;
import com.appaamma.pickles.domain.notification.NotificationLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@Tag(name = "Notification Webhooks", description = "MSG91 delivery status callbacks")
@RestController
@RequestMapping("/api/v1/notifications/webhooks")
@RequiredArgsConstructor
public class NotificationWebhookController {

    private final NotificationLogRepository notificationLogRepository;

    @Operation(summary = "Receive MSG91 WhatsApp delivery/read status callbacks")
    @PostMapping("/msg91/whatsapp")
    public ResponseEntity<Map<String, String>> msg91WhatsAppCallback(
            @RequestBody Msg91WhatsAppWebhookPayload payload) {

        log.info("MSG91 WhatsApp webhook received: messageId={}, recipient={}, status={}",
                payload.getMessageId(), payload.getRecipient(), payload.getStatus());

        if (payload.getRecipient() == null || payload.getStatus() == null) {
            log.warn("MSG91 WhatsApp webhook missing required fields: {}", payload);
            return ResponseEntity.ok(Map.of("status", "ignored"));
        }

        NotificationDispatchStatus mappedStatus = mapStatus(payload.getStatus());
        if (mappedStatus == null) {
            log.debug("MSG91 WhatsApp webhook status not actionable: {}", payload.getStatus());
            return ResponseEntity.ok(Map.of("status", "acknowledged"));
        }

        notificationLogRepository.findTopByRecipientAndProviderNameOrderByCreatedAtDesc(
                payload.getRecipient(), "msg91-whatsapp"
        ).ifPresent(notificationLog -> {
            notificationLog.setStatus(mappedStatus);
            if (payload.getErrorMessage() != null) {
                notificationLog.setFailureReason(payload.getErrorMessage());
            }
            notificationLogRepository.save(notificationLog);
            log.info("Updated notification log {} status to {} for recipient {}",
                    notificationLog.getId(), mappedStatus, payload.getRecipient());
        });

        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    private NotificationDispatchStatus mapStatus(String msg91Status) {
        if (msg91Status == null) return null;
        return switch (msg91Status.toLowerCase()) {
            case "delivered", "read" -> NotificationDispatchStatus.SENT;
            case "failed", "undelivered" -> NotificationDispatchStatus.FAILED;
            default -> null;
        };
    }
}
