import { http } from "@/shared/lib/http";
import type { AdminLoginRequest, AdminSession } from "./types";

export const adminAuthApi = {
  login: (input: AdminLoginRequest) =>
    http<AdminSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),
};