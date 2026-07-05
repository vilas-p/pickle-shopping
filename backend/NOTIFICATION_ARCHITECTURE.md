# Notification Architecture

This subsystem centralizes SMS, WhatsApp, and Email delivery around database-driven templates, queue tables, retry processing, and domain events.

## Overview

- `notification_template`: template source of truth
- `notification_log`: immutable delivery audit trail
- `sms_queue`, `whatsapp_queue`, `email_queue`: channel-specific dispatch queues
- `NotificationService`: resolves templates, renders placeholders, creates logs, and enqueues work
- `NotificationQueueProcessor`: async dispatcher with retry and dead-letter behavior
- Provider interfaces: `SmsProvider`, `WhatsAppProvider`, `EmailProvider`
- Event listeners: translate business events into notification requests

## Flow

```mermaid
flowchart TD
    A[Business Service] --> B[Publish Domain Event]
    B --> C[NotificationEventListener]
    C --> D[NotificationService]
    D --> E[notification_template]
    D --> F[notification_log]
    D --> G[sms_queue / whatsapp_queue / email_queue]
    G --> H[NotificationQueueProcessor]
    H --> I[Channel Provider]
    I --> J[notification_log updated]
```

## Order Sequence

```mermaid
sequenceDiagram
    participant OrderService
    participant EventBus as Spring Events
    participant Listener as NotificationEventListener
    participant Service as NotificationService
    participant Queue as Queue Table
    participant Processor as NotificationQueueProcessor
    participant Provider as SMS/WA/Email Provider

    OrderService->>EventBus: publish OrderPlacedEvent
    EventBus->>Listener: OrderPlacedEvent
    Listener->>Service: sendWhatsApp/sendEmail
    Service->>Service: render template placeholders
    Service->>Queue: insert queued row
    Service->>Processor: dispatch async
    Processor->>Provider: send rendered content
    Provider-->>Processor: provider response
    Processor->>Service: update log and queue status
```

## Template Placeholders

- `{{CustomerName}}`
- `{{OrderId}}`
- `{{Amount}}`
- `{{Items}}`
- `{{TrackingNumber}}`
- `{{TrackingUrl}}`
- `{{OTP}}`
- `{{ReviewLink}}`
- `{{ExpiryMinutes}}`

## Extensibility

To add a new channel such as push notifications:

1. Add a new `NotificationChannel` enum value.
2. Create a queue table and entity for that channel.
3. Introduce a new provider interface and provider implementations.
4. Add dispatch logic in `NotificationQueueProcessor`.
5. Create templates in `notification_template` using the new channel.

The business-event layer remains unchanged.