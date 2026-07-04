package com.appaamma.pickles.api.v1.notification;

import com.appaamma.pickles.config.NotificationProperties;
import com.appaamma.pickles.domain.notification.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class NotificationServiceTest {

    @Test
    void queuesSmsNotificationAndCreatesLog() {
        NotificationTemplateRepository templateRepository = mock(NotificationTemplateRepository.class);
        NotificationLogRepository logRepository = mock(NotificationLogRepository.class);
        SmsQueueRepository smsQueueRepository = mock(SmsQueueRepository.class);
        WhatsAppQueueRepository whatsAppQueueRepository = mock(WhatsAppQueueRepository.class);
        EmailQueueRepository emailQueueRepository = mock(EmailQueueRepository.class);
        NotificationQueueProcessor processor = mock(NotificationQueueProcessor.class);

        NotificationTemplate template = NotificationTemplate.builder()
                .id(1L)
                .templateCode("LOGIN_OTP_SMS")
                .channel(NotificationChannel.SMS)
                .bodyTemplate("OTP {{OTP}}")
                .active(true)
                .build();

        when(templateRepository.findByTemplateCodeAndActiveTrue("LOGIN_OTP_SMS")).thenReturn(java.util.Optional.of(template));
        when(logRepository.save(any(NotificationLog.class))).thenAnswer(invocation -> {
            NotificationLog log = invocation.getArgument(0);
            log.setId(10L);
            log.setCreatedAt(Instant.now());
            log.setUpdatedAt(Instant.now());
            return log;
        });
        when(smsQueueRepository.save(any(SmsQueue.class))).thenAnswer(invocation -> {
            SmsQueue queue = invocation.getArgument(0);
            queue.setId(20L);
            return queue;
        });

        NotificationService service = new NotificationService(
                templateRepository,
                logRepository,
                smsQueueRepository,
                whatsAppQueueRepository,
                emailQueueRepository,
                new NotificationTemplateEngine(),
                processor,
                new NotificationProperties(
                        3,
                        Duration.ofMinutes(5),
                        Duration.ofMinutes(1),
                        true,
                    new NotificationProperties.Sms(SmsProviderType.MOCK, null, null, null, null, null, null, null),
                    new NotificationProperties.WhatsApp(com.appaamma.pickles.domain.notification.WhatsAppProviderType.MOCK, null, null, null, null),
                    new NotificationProperties.Email(com.appaamma.pickles.domain.notification.EmailProviderType.MOCK, null, null, null, null, null, null, null, null)
                ),
                new ObjectMapper()
        );

        NotificationLog log = service.sendSms("LOGIN_OTP_SMS", "919999999999", Map.of("OTP", "123456"));

        assertThat(log.getTemplateCode()).isEqualTo("LOGIN_OTP_SMS");
        assertThat(log.getChannel()).isEqualTo(NotificationChannel.SMS);
        verify(smsQueueRepository).save(any(SmsQueue.class));
        verify(processor).dispatchSms(20L);
    }
}