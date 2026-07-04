"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/shared/lib/http";
import type { AdminContact, ContactHandledFilter } from "../types";
import { adminContactsApi } from "../api";

const CONTACT_FILTERS: ContactHandledFilter[] = ["ALL", "UNHANDLED", "HANDLED"];

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function filterLabel(filter: ContactHandledFilter): string {
  switch (filter) {
    case "UNHANDLED":
      return "Unhandled";
    case "HANDLED":
      return "Handled";
    default:
      return "All contacts";
  }
}

function statusTone(contact: AdminContact): string {
  return contact.handled
    ? "bg-brand-cream-100 text-brand-earth-800 ring-brand-cream-200"
    : "bg-brand-primary-50 text-brand-primary-700 ring-brand-primary-100";
}

export function AdminContactsBoard() {
  const [handledFilter, setHandledFilter] = useState<ContactHandledFilter>("UNHANDLED");
  const [page, setPage] = useState(0);
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingContactId, setUpdatingContactId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await adminContactsApi.list({ handled: handledFilter, page, size: 10 });
        if (cancelled) {
          return;
        }

        setContacts(result.content);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }

        if (err instanceof ApiError && err.status === 401) {
          setError("Your admin session expired. Please sign in again.");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load contact messages.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [handledFilter, page]);

  const visibleSummary = useMemo(() => {
    const unread = contacts.filter((contact) => !contact.handled).length;
    const handled = contacts.length - unread;
    return { unread, handled };
  }, [contacts]);

  const toggleHandled = async (contact: AdminContact, handled: boolean) => {
    setUpdatingContactId(contact.id);
    setError("");

    try {
      const updated = await adminContactsApi.markHandled(contact.id, handled);

      if (handledFilter === "UNHANDLED" && handled) {
        setContacts((current) => current.filter((item) => item.id !== contact.id));
        setTotalElements((current) => Math.max(0, current - 1));
        return;
      }

      if (handledFilter === "HANDLED" && !handled) {
        setContacts((current) => current.filter((item) => item.id !== contact.id));
        setTotalElements((current) => Math.max(0, current - 1));
        return;
      }

      setContacts((current) => current.map((item) => (item.id === contact.id ? updated : item)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update contact status.");
    } finally {
      setUpdatingContactId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card-warm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary-700">
              Contact inbox
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-brand-earth-900">
              See every customer message and close the loop after you reply
            </h2>
            <p className="mt-3 max-w-3xl text-brand-earth-700/80">
              New contact form submissions land here. Keep unhandled messages visible until someone follows up, then mark them handled.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-brand-cream-50 px-4 py-3 ring-1 ring-brand-cream-200">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Loaded now</p>
              <p className="mt-1 text-lg font-bold text-brand-earth-900">{contacts.length}</p>
            </div>
            <div className="rounded-2xl bg-brand-cream-50 px-4 py-3 ring-1 ring-brand-cream-200">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Unhandled on page</p>
              <p className="mt-1 text-lg font-bold text-brand-earth-900">{visibleSummary.unread}</p>
            </div>
            <div className="rounded-2xl bg-brand-cream-50 px-4 py-3 ring-1 ring-brand-cream-200">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Handled on page</p>
              <p className="mt-1 text-lg font-bold text-brand-earth-900">{visibleSummary.handled}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="card-warm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {CONTACT_FILTERS.map((filter) => {
              const active = handledFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    setHandledFilter(filter);
                    setPage(0);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-brand-primary-600 text-white"
                      : "bg-brand-cream-100 text-brand-earth-800 hover:bg-brand-cream-200"
                  }`}
                >
                  {filterLabel(filter)}
                </button>
              );
            })}
          </div>

          <p className="text-sm text-brand-earth-700/80">{totalElements} total messages in this view</p>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card-warm h-56 animate-pulse" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="card-warm text-center">
          <h3 className="font-display text-2xl font-semibold text-brand-earth-900">No contact messages found</h3>
          <p className="mt-2 text-brand-earth-700/80">
            There are no messages in the {filterLabel(handledFilter).toLowerCase()} view right now.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <article key={contact.id} className="card-warm overflow-hidden">
              <div className="flex flex-col gap-5 border-b border-brand-cream-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-2xl font-semibold text-brand-earth-900">
                      {contact.subject}
                    </h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusTone(contact)}`}>
                      {contact.handled ? "Handled" : "Needs reply"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-brand-earth-700/75">
                    Received on {formatDateTime(contact.createdAt)}
                  </p>
                </div>

                <div className="rounded-2xl bg-brand-cream-50 px-4 py-3 ring-1 ring-brand-cream-200 lg:min-w-72">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Follow-up status</p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    {contact.handled ? (
                      <button
                        type="button"
                        onClick={() => void toggleHandled(contact, false)}
                        disabled={updatingContactId === contact.id}
                        className="btn-secondary justify-center disabled:opacity-60"
                      >
                        {updatingContactId === contact.id ? "Saving..." : "Mark unhandled"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void toggleHandled(contact, true)}
                        disabled={updatingContactId === contact.id}
                        className="btn-primary justify-center disabled:opacity-60"
                      >
                        {updatingContactId === contact.id ? "Saving..." : "Mark handled"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-6 pt-5 lg:grid-cols-[320px_1fr]">
                <div className="rounded-2xl bg-brand-cream-50 px-4 py-4 ring-1 ring-brand-cream-200">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Customer details</p>
                  <div className="mt-3 space-y-3 text-sm text-brand-earth-800">
                    <div>
                      <p className="font-semibold text-brand-earth-900">{contact.fullName}</p>
                      <p>{contact.email}</p>
                      <p>{contact.phone || "Phone not provided"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/80 px-5 py-4 ring-1 ring-brand-cream-200">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Message</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-brand-earth-800">
                    {contact.message}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="card-warm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-earth-900">Page {page + 1}</p>
          <p className="text-sm text-brand-earth-700/80">
            {totalPages === 0 ? "1" : totalPages} total pages
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={page === 0 || loading}
            className="btn-secondary justify-center disabled:opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={loading || totalPages === 0 || page >= totalPages - 1}
            className="btn-secondary justify-center disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}