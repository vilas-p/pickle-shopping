import { http } from "@/shared/lib/http";
import type {
  AuthSession,
  CustomerSummary,
  RequestOtpInput,
  RequestOtpResult,
  UpdateCustomerProfileInput,
  VerifyOtpInput,
} from "./types";

export const authApi = {
  requestOtp(input: RequestOtpInput): Promise<RequestOtpResult> {
    return http<RequestOtpResult>("/customer-auth/otp/request", {
      method: "POST",
      body: JSON.stringify(input),
      cache: "no-store",
    });
  },

  verifyOtp(input: VerifyOtpInput): Promise<AuthSession> {
    return http<AuthSession>("/customer-auth/otp/verify", {
      method: "POST",
      body: JSON.stringify(input),
      cache: "no-store",
    });
  },

  me(): Promise<CustomerSummary> {
    return http<CustomerSummary>("/customer-auth/me", {
      method: "GET",
      auth: true,
      cache: "no-store",
    });
  },

  updateMe(input: UpdateCustomerProfileInput): Promise<CustomerSummary> {
    return http<CustomerSummary>("/customer-auth/me", {
      method: "PUT",
      auth: true,
      body: JSON.stringify(input),
      cache: "no-store",
    });
  },
};
