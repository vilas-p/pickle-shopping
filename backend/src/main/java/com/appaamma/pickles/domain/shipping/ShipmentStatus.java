package com.appaamma.pickles.domain.shipping;

public enum ShipmentStatus {
    CREATED,
    AWB_ASSIGNED,
    LABEL_GENERATED,
    PICKUP_SCHEDULED,
    PICKED_UP,
    IN_TRANSIT,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED,
    RTO_INITIATED,
    RTO_DELIVERED,
    CREATION_FAILED
}
