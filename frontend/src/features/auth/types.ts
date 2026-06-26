export type OtpIdentifierKind = "PHONE" | "EMAIL";

export interface CustomerSummary {
  id: number;
  fullName: string;
  email: string;
  phone: string;
}

export interface UpdateCustomerProfileInput {
  fullName: string;
  email: string;
  phone: string;
}

export interface RequestOtpInput {
  kind: OtpIdentifierKind;
  identifier: string;
}

export interface RequestOtpResult {
  channel: string;
  expiresAt: string;
}

export interface VerifyOtpInput {
  kind: OtpIdentifierKind;
  identifier: string;
  code: string;
  fullName?: string;
}

export interface AuthSession {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
  customer: CustomerSummary;
}
