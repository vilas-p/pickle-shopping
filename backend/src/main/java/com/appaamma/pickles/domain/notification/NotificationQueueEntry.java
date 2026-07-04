package com.appaamma.pickles.domain.notification;

import com.appaamma.pickles.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@MappedSuperclass
@Getter
@Setter
public abstract class NotificationQueueEntry extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_code", nullable = false, length = 120)
    private String templateCode;

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
    private int attemptCount;

    @Column(name = "max_attempts", nullable = false)
    private int maxAttempts;

    @Column(name = "next_attempt_at", nullable = false)
    private Instant nextAttemptAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_log_id", nullable = false)
    private NotificationLog notificationLog;
}