"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "../api";
import { useAuthStore } from "../store";
import type { OtpIdentifierKind } from "../types";
import { useApiSubmit } from "@/shared/hooks/useApiSubmit";

type Step = "request" | "verify";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);

  const [step, setStep] = useState<Step>("request");
  const [kind, setKind] = useState<OtpIdentifierKind>("PHONE");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");

  const request = useApiSubmit(authApi.requestOtp);
  const verify = useApiSubmit(authApi.verifyOtp);

  const onRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await request.submit({ kind, identifier: identifier.trim() });
    if (res) setStep("verify");
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await verify.submit({
      kind,
      identifier: identifier.trim(),
      code: code.trim(),
      fullName: fullName.trim() || undefined,
    });
    if (res) {
      setSession(res);
      const redirect = search.get("redirect") ?? "/account";
      router.push(redirect);
    }
  };

  if (step === "request") {
    return (
      <form onSubmit={onRequest} className="card-warm space-y-5">
        <fieldset className="flex gap-2 rounded-full bg-brand-cream-100 p-1">
          {(["PHONE", "EMAIL"] as const).map((k) => (
            <label
              key={k}
              className={`flex-1 cursor-pointer rounded-full px-4 py-2 text-center text-sm font-medium transition ${
                kind === k
                  ? "bg-white text-brand-primary-700 shadow-sm"
                  : "text-brand-earth-700/80 hover:text-brand-earth-900"
              }`}
            >
              <input
                type="radio"
                name="kind"
                value={k}
                checked={kind === k}
                onChange={() => setKind(k)}
                className="sr-only"
              />
              {k === "PHONE" ? "Phone" : "Email"}
            </label>
          ))}
        </fieldset>

        <div>
          <label htmlFor="identifier" className="label-field">
            {kind === "PHONE" ? "Mobile number" : "Email address"}
          </label>
          <input
            id="identifier"
            type={kind === "PHONE" ? "tel" : "email"}
            inputMode={kind === "PHONE" ? "tel" : "email"}
            autoComplete={kind === "PHONE" ? "tel" : "email"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={kind === "PHONE" ? "+91 98765 43210" : "you@example.com"}
            required
            className="input-field"
          />
        </div>

        {request.status === "error" && (
          <p role="alert" className="text-sm text-red-700">{request.message}</p>
        )}

        <button
          type="submit"
          disabled={request.status === "submitting"}
          className="btn-primary w-full justify-center disabled:opacity-60"
        >
          {request.status === "submitting" ? "Sending…" : "Send code"}
        </button>

        <p className="text-center text-xs text-brand-earth-700/70">
          We&apos;ll send a one-time code. No password to remember.
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={onVerify} className="card-warm space-y-5">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-brand-earth-800">
          Code sent to <span className="font-semibold">{identifier}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setStep("request");
            setCode("");
            verify.reset();
            request.reset();
          }}
          className="text-sm font-medium text-brand-primary-700 hover:underline"
        >
          Change
        </button>
      </div>

      <div>
        <label htmlFor="code" className="label-field">Verification code</label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={8}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          required
          className="input-field text-center text-2xl tracking-[0.5em]"
        />
      </div>

      <div>
        <label htmlFor="fullName" className="label-field">
          Your name <span className="text-brand-earth-700/60">(new accounts only)</span>
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Asha Iyer"
          className="input-field"
        />
      </div>

      {verify.status === "error" && (
        <p role="alert" className="text-sm text-red-700">{verify.message}</p>
      )}

      <button
        type="submit"
        disabled={verify.status === "submitting" || code.length < 4}
        className="btn-primary w-full justify-center disabled:opacity-60"
      >
        {verify.status === "submitting" ? "Verifying…" : "Sign in"}
      </button>
    </form>
  );
}
