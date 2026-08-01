package com.appaamma.pickles.domain.shipping;

import com.appaamma.pickles.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "shipment_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentEvent extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "status_code")
    private Integer statusCode;

    @Column(length = 500)
    private String description;

    @Column(length = 200)
    private String location;

    @Column(name = "event_time", nullable = false)
    private Instant eventTime;

    @Column(name = "shiprocket_status", length = 100)
    private String shiprocketStatus;

    @Column(name = "raw_payload", columnDefinition = "JSON")
    private String rawPayload;
}
