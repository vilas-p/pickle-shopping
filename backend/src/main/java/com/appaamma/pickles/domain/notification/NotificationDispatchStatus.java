package com.appaamma.pickles.domain.notification;

public enum NotificationDispatchStatus {
    QUEUED,
    PROCESSING,
    SENT,
    FAILED,
    DEAD_LETTER,
    SKIPPED
}