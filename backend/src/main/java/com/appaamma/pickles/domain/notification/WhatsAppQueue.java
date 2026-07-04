package com.appaamma.pickles.domain.notification;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "whatsapp_queue")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class WhatsAppQueue extends NotificationQueueEntry {
}