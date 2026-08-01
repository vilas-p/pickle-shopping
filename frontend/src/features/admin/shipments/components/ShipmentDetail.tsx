"use client";

import { useEffect, useState } from "react";
import { adminShipmentsApi } from "../api";
import { ShipmentStatusBadge } from "@/features/shipping/components/ShipmentStatusBadge";
import type { Shipment } from "@/features/shipping/types";

interface ShipmentDetailProps {
  shipmentId: number;
}

export function ShipmentDetail({ shipmentId }: ShipmentDetailProps) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadShipment();
  }, [shipmentId]);

  async function loadShipment() {
    setLoading(true);
    try {
      const data = await adminShipmentsApi.getById(shipmentId);
      setShipment(data);
    } catch (err) {
      console.error("Failed to load shipment", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignAwb() {
    setActionLoading(true);
    try {
      const updated = await adminShipmentsApi.assignAwb(shipmentId);
      setShipment(updated);
    } catch (err) {
      alert("Failed to assign AWB");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSchedulePickup() {
    setActionLoading(true);
    try {
      const updated = await adminShipmentsApi.schedulePickup(shipmentId);
      setShipment(updated);
    } catch (err) {
      alert("Failed to schedule pickup");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    const reason = prompt("Cancellation reason:");
    if (!reason) return;
    setActionLoading(true);
    try {
      const updated = await adminShipmentsApi.cancel(shipmentId, reason);
      setShipment(updated);
    } catch (err) {
      alert("Failed to cancel shipment");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDownloadLabel() {
    try {
      const labelUrl = await adminShipmentsApi.getLabel(shipmentId);
      if (labelUrl) {
        window.open(labelUrl, "_blank");
      }
    } catch (err) {
      alert("Failed to get label");
    }
  }

  if (loading) {
    return <div className="p-6">Loading shipment...</div>;
  }

  if (!shipment) {
    return <div className="p-6">Shipment not found.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Shipment #{shipment.id} — {shipment.orderNumber}
        </h1>
        <ShipmentStatusBadge status={shipment.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-gray-500">AWB Number</p>
          <p className="font-medium">{shipment.awbNumber ?? "Not assigned"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Courier</p>
          <p className="font-medium">{shipment.courierName ?? "Not assigned"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Shiprocket Order ID</p>
          <p className="font-medium">{shipment.shiprocketOrderId ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Shiprocket Shipment ID</p>
          <p className="font-medium">{shipment.shiprocketShipmentId ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Pickup Scheduled</p>
          <p className="font-medium">{shipment.pickupScheduledDate ?? "Not scheduled"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Est. Delivery</p>
          <p className="font-medium">{shipment.estimatedDeliveryDate ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Weight (kg)</p>
          <p className="font-medium">{shipment.weight ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Shipping Charge</p>
          <p className="font-medium">
            {shipment.shippingCharge != null ? `₹${shipment.shippingCharge}` : "—"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {shipment.status === "CREATED" && (
          <button
            onClick={handleAssignAwb}
            disabled={actionLoading}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Assign AWB
          </button>
        )}
        {shipment.status === "AWB_ASSIGNED" && (
          <button
            onClick={handleSchedulePickup}
            disabled={actionLoading}
            className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Schedule Pickup
          </button>
        )}
        {shipment.awbNumber && (
          <button
            onClick={handleDownloadLabel}
            className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Download Label
          </button>
        )}
        {!["DELIVERED", "CANCELLED", "RTO_DELIVERED"].includes(shipment.status) && (
          <button
            onClick={handleCancel}
            disabled={actionLoading}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            Cancel Shipment
          </button>
        )}
      </div>
    </div>
  );
}
