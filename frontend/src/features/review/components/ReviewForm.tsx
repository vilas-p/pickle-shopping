"use client";

import { useState, type FormEvent } from "react";
import { reviewsApi } from "../api";
import { useApiSubmit } from "@/shared/hooks/useApiSubmit";

export function ReviewForm() {
  const [rating, setRating] = useState(5);
  const { status, message, submit } = useApiSubmit(reviewsApi.create, {
    successMessage: "Thank you! Your review will be visible after moderation.",
  });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const result = await submit({
      authorName: String(fd.get("authorName") ?? ""),
      authorCity: String(fd.get("authorCity") ?? "") || undefined,
      rating,
      title: String(fd.get("title") ?? ""),
      body: String(fd.get("body") ?? ""),
    });
    if (result) {
      form.reset();
      setRating(5);
    }
  };

  return (
    <form onSubmit={onSubmit} className="card-warm space-y-4">
      <h3 className="font-display text-2xl text-brand-earth-900">Write a review</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="authorName" className="label-field">Your name</label>
          <input id="authorName" name="authorName" required className="input-field" />
        </div>
        <div>
          <label htmlFor="authorCity" className="label-field">City (optional)</label>
          <input id="authorCity" name="authorCity" className="input-field" />
        </div>
      </div>

      <div>
        <p className="label-field">Rating</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star`}
              className={
                n <= rating
                  ? "text-2xl text-brand-secondary-500"
                  : "text-2xl text-brand-cream-300"
              }
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="title" className="label-field">Title</label>
        <input id="title" name="title" required className="input-field" />
      </div>
      <div>
        <label htmlFor="body" className="label-field">Your review</label>
        <textarea id="body" name="body" required rows={4} className="input-field" />
      </div>

      <button type="submit" disabled={status === "submitting"} className="btn-primary">
        {status === "submitting" ? "Submitting…" : "Submit Review"}
      </button>

      {status !== "idle" && message && (
        <p
          role={status === "error" ? "alert" : "status"}
          className={
            status === "success"
              ? "rounded-xl bg-brand-leaf-500/10 px-4 py-3 text-sm text-brand-leaf-700"
              : "rounded-xl bg-brand-primary-100 px-4 py-3 text-sm text-brand-primary-700"
          }
        >
          {message}
        </p>
      )}
    </form>
  );
}
