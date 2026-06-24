import { http } from "@/shared/lib/http";
import type { DashboardStats } from "./types";

export const adminDashboardApi = {
  getStats: () =>
    http<DashboardStats>("/admin/dashboard/stats", {
      auth: "admin",
      cache: "no-store",
    }),
};