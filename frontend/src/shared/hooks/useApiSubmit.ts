"use client";

import { useState, useCallback } from "react";

export type SubmitStatus = "idle" | "submitting" | "success" | "error";

export interface UseApiSubmitResult<I, O> {
  status: SubmitStatus;
  message: string;
  data: O | null;
  submit: (input: I) => Promise<O | undefined>;
  reset: () => void;
}

/**
 * Centralizes the idle/submitting/success/error pattern previously duplicated
 * across OrderForm, ContactForm and ReviewForm.
 */
export function useApiSubmit<I, O>(
  fn: (input: I) => Promise<O>,
  options?: { successMessage?: string },
): UseApiSubmitResult<I, O> {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [message, setMessage] = useState("");
  const [data, setData] = useState<O | null>(null);

  const submit = useCallback(
    async (input: I) => {
      setStatus("submitting");
      setMessage("");
      try {
        const result = await fn(input);
        setData(result);
        setStatus("success");
        if (options?.successMessage) setMessage(options.successMessage);
        return result;
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        return undefined;
      }
    },
    [fn, options?.successMessage],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setMessage("");
    setData(null);
  }, []);

  return { status, message, data, submit, reset };
}
