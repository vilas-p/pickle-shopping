package com.appaamma.pickles.domain.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    Page<NotificationLog> findAllByChannel(NotificationChannel channel, Pageable pageable);
    Page<NotificationLog> findAllByTemplateCode(String templateCode, Pageable pageable);
}