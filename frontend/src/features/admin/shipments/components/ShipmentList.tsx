"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminShipmentsApi } from "../api";
import { ShipmentStatusBadge } from "@/features/shipping/components/ShipmentStatusBadge";
import type { Shipment } from "@/features/shipping/types";

export function ShipmentList() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadShipments();
  }, [page]);

  async function loadShipments() {
    setLoading(true);
    try {
      const data = await adminShipmentsApi.list(page);
      setShipments(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to load shipments", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-6">Loading shipments...</div>;
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Shipments</h1>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Order #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                AWB
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Courier
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {shipments.map((s) => (
              <tr key={s.id}>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                  {s.orderNumber}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  {s.awbNumber ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  {s.courierName ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <ShipmentStatusBadge status={s.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <Link
                    href={`/admin/shipments/${s.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {shipments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No shipments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
