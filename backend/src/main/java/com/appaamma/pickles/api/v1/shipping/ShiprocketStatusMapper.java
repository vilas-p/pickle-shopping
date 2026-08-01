package com.appaamma.pickles.api.v1.shipping;

import com.appaamma.pickles.domain.order.OrderStatus;
import com.appaamma.pickles.domain.shipping.ShipmentStatus;

import java.util.Map;

public final class ShiprocketStatusMapper {

    private ShiprocketStatusMapper() {}

    private static final Map<Integer, ShipmentStatus> SHIPMENT_STATUS_MAP = Map.ofEntries(
            Map.entry(1, ShipmentStatus.AWB_ASSIGNED),
            Map.entry(2, ShipmentStatus.LABEL_GENERATED),
            Map.entry(3, ShipmentStatus.PICKUP_SCHEDULED),
            Map.entry(4, ShipmentStatus.PICKUP_SCHEDULED),
            Map.entry(5, ShipmentStatus.PICKUP_SCHEDULED),
            Map.entry(6, ShipmentStatus.IN_TRANSIT),
            Map.entry(7, ShipmentStatus.DELIVERED),
            Map.entry(8, ShipmentStatus.CANCELLED),
            Map.entry(9, ShipmentStatus.RTO_INITIATED),
            Map.entry(10, ShipmentStatus.RTO_DELIVERED),
            Map.entry(17, ShipmentStatus.OUT_FOR_DELIVERY),
            Map.entry(18, ShipmentStatus.IN_TRANSIT),
            Map.entry(19, ShipmentStatus.PICKUP_SCHEDULED),
            Map.entry(38, ShipmentStatus.IN_TRANSIT)
    );

    private static final Map<Integer, OrderStatus> ORDER_STATUS_MAP = Map.of(
            6, OrderStatus.SHIPPED,
            7, OrderStatus.DELIVERED,
            8, OrderStatus.CANCELLED,
            9, OrderStatus.RTO_INITIATED,
            10, OrderStatus.RTO_DELIVERED,
            17, OrderStatus.OUT_FOR_DELIVERY
    );

    public static ShipmentStatus toShipmentStatus(int statusId) {
        return SHIPMENT_STATUS_MAP.getOrDefault(statusId, ShipmentStatus.IN_TRANSIT);
    }

    public static OrderStatus toOrderStatus(int statusId) {
        return ORDER_STATUS_MAP.get(statusId);
    }

    public static boolean shouldUpdateOrderStatus(int statusId) {
        return ORDER_STATUS_MAP.containsKey(statusId);
    }
}
