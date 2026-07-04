package com.appaamma.pickles.domain.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface WhatsAppQueueRepository extends JpaRepository<WhatsAppQueue, Long> {
    List<WhatsAppQueue> findTop50ByStatusInAndNextAttemptAtBeforeOrderByCreatedAtAsc(
            List<NotificationDispatchStatus> statuses,
            Instant nextAttemptAt
    );
}