"use client";

import { useState } from "react";
import { shippingApi } from "../api";
import type { CourierOption } from "../types";

interface ServiceabilityCheckProps {
  onResult: (serviceable: boolean, couriers: CourierOption[]) => void;
  weight?: number;
  cod?: boolean;
}

export function ServiceabilityCheck({
  onResult,
  weight = 0.5,
  cod = false,
}: ServiceabilityCheckProps) {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (pincode.length !== 6) {
      setError("Please enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await shippingApi.checkServiceability({
        deliveryPincode: pincode,
        weight,
        cod,
      });
      onResult(result.serviceable, result.availableCouriers);
      if (!result.serviceable) {
        setError("Sorry, delivery is not available to this pincode");
      }
    } catch {
      setError("Unable to check serviceability. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter delivery pincode"
          className="flex-1 rounded-md border px-3 py-2"
        />
        <button
          onClick={handleCheck}
          disabled={loading || pincode.length !== 6}
          className="rounded-md bg-green-700 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
