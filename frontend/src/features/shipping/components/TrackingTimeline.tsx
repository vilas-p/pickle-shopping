"use client";

import type { TrackingEvent } from "../types";

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus: string;
  courierName?: string;
  awbNumber?: string;
}

export function TrackingTimeline({
  events,
  currentStatus,
  courierName,
  awbNumber,
}: TrackingTimelineProps) {
  return (
    <div className="space-y-4">
      {courierName && awbNumber && (
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            Courier: <strong>{courierName}</strong>
          </span>
          <span>
            AWB: <strong>{awbNumber}</strong>
          </span>
        </div>
      )}

      {currentStatus && (
        <p className="text-sm font-medium text-green-700">
          Current Status: {currentStatus.replace(/_/g, " ")}
        </p>
      )}

      <div className="relative">
        {events.map((event, index) => (
          <div key={index} className="flex gap-4 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <div
                className={`h-3 w-3 rounded-full ${
                  index === events.length - 1
                    ? "bg-green-600"
                    : "bg-gray-300"
                }`}
              />
              {index < events.length - 1 && (
                <div className="w-0.5 flex-1 bg-gray-200" />
              )}
            </div>
            <div className="-mt-1 flex-1">
              <p className="text-sm font-medium">{event.status}</p>
              {event.description && (
                <p className="text-sm text-gray-600">{event.description}</p>
              )}
              <div className="mt-1 flex gap-2 text-xs text-gray-500">
                {event.location && <span>{event.location}</span>}
                <span>{new Date(event.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
