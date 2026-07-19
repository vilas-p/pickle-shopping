package com.appaamma.pickles.api.v1.notification;

import com.appaamma.pickles.api.v1.notification.dto.Msg91WhatsAppWebhookPayload;
import com.appaamma.pickles.domain.notification.NotificationChannel;
import com.appaamma.pickles.domain.notification.NotificationDispatchStatus;
import com.appaamma.pickles.domain.notification.NotificationLog;
import com.appaamma.pickles.domain.notification.NotificationLogRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class NotificationWebhookControllerTest {

    private final NotificationLogRepository logRepository = mock(NotificationLogRepository.class);
    private final NotificationWebhookController controller = new NotificationWebhookController(logRepository);

    @Test
    void deliveredStatusUpdatesLogToSent() {
        NotificationLog existingLog = NotificationLog.builder()
                .id(1L)
                .templateCode("ORDER_CONFIRMED_WHATSAPP")
                .channel(NotificationChannel.WHATSAPP)
                .recipient("919999999999")
                .renderedMessage("Your order is confirmed")
                .status(NotificationDispatchStatus.QUEUED)
                .providerName("msg91-whatsapp")
                .build();

        when(logRepository.findTopByRecipientAndProviderNameOrderByCreatedAtDesc("919999999999", "msg91-whatsapp"))
                .thenReturn(Optional.of(existingLog));

        Msg91WhatsAppWebhookPayload payload = new Msg91WhatsAppWebhookPayload();
        payload.setMessageId("msg-123");
        payload.setRecipient("919999999999");
        payload.setStatus("delivered");

        ResponseEntity<Map<String, String>> response = controller.msg91WhatsAppCallback(payload);

        assertThat(response.getBody()).containsEntry("status", "ok");
        assertThat(existingLog.getStatus()).isEqualTo(NotificationDispatchStatus.SENT);
        verify(logRepository).save(existingLog);
    }

    @Test
    void failedStatusUpdatesLogToFailed() {
        NotificationLog existingLog = NotificationLog.builder()
                .id(2L)
                .templateCode("OTP_WHATSAPP")
                .channel(NotificationChannel.WHATSAPP)
                .recipient("918888888888")
                .renderedMessage("Your OTP is 123456")
                .status(NotificationDispatchStatus.SENT)
                .providerName("msg91-whatsapp")
                .build();

        when(logRepository.findTopByRecipientAndProviderNameOrderByCreatedAtDesc("918888888888", "msg91-whatsapp"))
                .thenReturn(Optional.of(existingLog));

        Msg91WhatsAppWebhookPayload payload = new Msg91WhatsAppWebhookPayload();
        payload.setMessageId("msg-456");
        payload.setRecipient("918888888888");
        payload.setStatus("failed");
        payload.setErrorMessage("Number not on WhatsApp");

        ResponseEntity<Map<String, String>> response = controller.msg91WhatsAppCallback(payload);

        assertThat(response.getBody()).containsEntry("status", "ok");
        assertThat(existingLog.getStatus()).isEqualTo(NotificationDispatchStatus.FAILED);
        assertThat(existingLog.getFailureReason()).isEqualTo("Number not on WhatsApp");
        verify(logRepository).save(existingLog);
    }

    @Test
    void missingRecipientReturnsIgnored() {
        Msg91WhatsAppWebhookPayload payload = new Msg91WhatsAppWebhookPayload();
        payload.setMessageId("msg-789");
        payload.setStatus("delivered");
        // recipient is null

        ResponseEntity<Map<String, String>> response = controller.msg91WhatsAppCallback(payload);

        assertThat(response.getBody()).containsEntry("status", "ignored");
        verifyNoInteractions(logRepository);
    }

    @Test
    void unknownStatusReturnsAcknowledged() {
        Msg91WhatsAppWebhookPayload payload = new Msg91WhatsAppWebhookPayload();
        payload.setMessageId("msg-101");
        payload.setRecipient("919999999999");
        payload.setStatus("sent"); // "sent" is not mapped to an action

        ResponseEntity<Map<String, String>> response = controller.msg91WhatsAppCallback(payload);

        assertThat(response.getBody()).containsEntry("status", "acknowledged");
        verify(logRepository, never()).save(any());
    }

    @Test
    void readStatusUpdatesLogToSent() {
        NotificationLog existingLog = NotificationLog.builder()
                .id(3L)
                .templateCode("ALERT_WHATSAPP")
                .channel(NotificationChannel.WHATSAPP)
                .recipient("917777777777")
                .renderedMessage("Alert message")
                .status(NotificationDispatchStatus.SENT)
                .providerName("msg91-whatsapp")
                .build();

        when(logRepository.findTopByRecipientAndProviderNameOrderByCreatedAtDesc("917777777777", "msg91-whatsapp"))
                .thenReturn(Optional.of(existingLog));

        Msg91WhatsAppWebhookPayload payload = new Msg91WhatsAppWebhookPayload();
        payload.setMessageId("msg-202");
        payload.setRecipient("917777777777");
        payload.setStatus("read");

        ResponseEntity<Map<String, String>> response = controller.msg91WhatsAppCallback(payload);

        assertThat(response.getBody()).containsEntry("status", "ok");
        assertThat(existingLog.getStatus()).isEqualTo(NotificationDispatchStatus.SENT);
        verify(logRepository).save(existingLog);
    }
}
