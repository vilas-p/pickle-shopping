package com.appaamma.pickles.domain.notification;

import com.appaamma.pickles.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_log", indexes = {
        @Index(name = "idx_notification_log_template", columnList = "template_code"),
        @Index(name = "idx_notification_log_channel_status", columnList = "channel,status"),
        @Index(name = "idx_notification_log_recipient", columnList = "recipient")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_code", nullable = false, length = 120)
    private String templateCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationChannel channel;

    @Column(nullable = false, length = 200)
    private String recipient;

    @Column(length = 255)
    private String subject;

    @Column(name = "request_payload", columnDefinition = "LONGTEXT")
    private String requestPayload;

    @Column(name = "rendered_message", nullable = false, columnDefinition = "LONGTEXT")
    private String renderedMessage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationDispatchStatus status;

    @Column(name = "provider_name", length = 80)
    private String providerName;

    @Column(name = "provider_response", columnDefinition = "LONGTEXT")
    private String providerResponse;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "attempt_count", nullable = false)
    @Builder.Default
    private int attemptCount = 0;
}