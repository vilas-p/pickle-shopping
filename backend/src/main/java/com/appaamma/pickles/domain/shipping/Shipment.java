package com.appaamma.pickles.domain.shipping;

import com.appaamma.pickles.common.BaseEntity;
import com.appaamma.pickles.domain.order.Order;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "shiprocket_order_id")
    private Long shiprocketOrderId;

    @Column(name = "shiprocket_shipment_id")
    private Long shiprocketShipmentId;

    @Column(name = "awb_number", length = 50)
    private String awbNumber;

    @Column(name = "courier_name", length = 100)
    private String courierName;

    @Column(name = "courier_id")
    private Integer courierId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private ShipmentStatus status = ShipmentStatus.CREATED;

    @Column(name = "pickup_scheduled_date")
    private LocalDate pickupScheduledDate;

    @Column(name = "pickup_token", length = 100)
    private String pickupToken;

    @Column(name = "label_url", length = 500)
    private String labelUrl;

    @Column(name = "manifest_url", length = 500)
    private String manifestUrl;

    @Column(name = "invoice_url", length = 500)
    private String invoiceUrl;

    @Column(name = "estimated_delivery_date")
    private LocalDate estimatedDeliveryDate;

    @Column(name = "actual_delivery_date")
    private Instant actualDeliveryDate;

    @Column(name = "shipping_charge", precision = 10, scale = 2)
    private BigDecimal shippingCharge;

    @Column(precision = 6, scale = 3)
    private BigDecimal weight;

    @Column(name = "length", precision = 6, scale = 2)
    private BigDecimal length;

    @Column(name = "breadth", precision = 6, scale = 2)
    private BigDecimal breadth;

    @Column(name = "height", precision = 6, scale = 2)
    private BigDecimal height;

    @Column(name = "channel_order_id", length = 50)
    private String channelOrderId;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ShipmentEvent> events = new ArrayList<>();
}
