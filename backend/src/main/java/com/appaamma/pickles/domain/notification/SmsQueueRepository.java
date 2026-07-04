package com.appaamma.pickles.domain.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface SmsQueueRepository extends JpaRepository<SmsQueue, Long> {
    List<SmsQueue> findTop50ByStatusInAndNextAttemptAtBeforeOrderByCreatedAtAsc(
            List<NotificationDispatchStatus> statuses,
            Instant nextAttemptAt
    );
}