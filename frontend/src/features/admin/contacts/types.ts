export interface AdminContact {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  handled: boolean;
  createdAt: string;
}

export type ContactHandledFilter = "ALL" | "UNHANDLED" | "HANDLED";