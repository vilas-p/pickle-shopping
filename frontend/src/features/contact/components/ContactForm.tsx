"use client";

import type { FormEvent } from "react";
import { contactsApi } from "../api";
import { useApiSubmit } from "@/shared/hooks/useApiSubmit";

export function ContactForm() {
  const { status, message, submit } = useApiSubmit(contactsApi.submit, {
    successMessage: "Thank you! We'll get back to you soon.",
  });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const result = await submit({
      fullName: String(fd.get("fullName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? "") || undefined,
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
    });
    if (result !== undefined) form.reset();
  };

  return (
    <form onSubmit={onSubmit} className="card-warm space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="label-field">Your name</label>
          <input id="fullName" name="fullName" required className="input-field" />
        </div>
        <div>
          <label htmlFor="email" className="label-field">Email</label>
          <input id="email" name="email" type="email" required className="input-field" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="label-field">Phone (optional)</label>
          <input id="phone" name="phone" type="tel" className="input-field" placeholder="+91 9XXXXXXXXX" />
        </div>
        <div>
          <label htmlFor="subject" className="label-field">Subject</label>
          <input id="subject" name="subject" required className="input-field" />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="label-field">Message</label>
        <textarea id="message" name="message" required rows={5} className="input-field" />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-primary w-full sm:w-auto"
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>

      {status !== "idle" && message && (
        <p
          role={status === "error" ? "alert" : "status"}
          className={
            status === "success"
              ? "rounded-xl bg-brand-leaf-500/10 px-4 py-3 text-sm text-brand-leaf-700"
              : status === "error"
                ? "rounded-xl bg-brand-primary-100 px-4 py-3 text-sm text-brand-primary-700"
                : ""
          }
        >
          {message}
        </p>
      )}
    </form>
  );
}
