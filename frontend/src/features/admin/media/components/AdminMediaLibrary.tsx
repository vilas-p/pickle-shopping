"use client";

import { useState } from "react";
import { ApiError } from "@/shared/lib/http";
import { adminMediaApi } from "../api";
import type { ProductMediaUploadResult } from "../types";

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "error"; message: string }
  | { status: "success"; result: ProductMediaUploadResult };

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminMediaLibrary() {
  const [productSlug, setProductSlug] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>({ status: "idle" });

  const upload = async () => {
    if (!file) {
      setState({ status: "error", message: "Choose an image or video before uploading." });
      return;
    }

    setState({ status: "uploading" });
    try {
      const result = await adminMediaApi.uploadProductMedia(file, productSlug);
      setState({ status: "success", result });
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        setState({ status: "error", message: "Your admin session expired. Sign in again and retry the upload." });
        return;
      }

      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Upload failed.",
      });
    }
  };

  const result = state.status === "success" ? state.result : null;

  return (
    <div className="space-y-6">
      <section className="card-warm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary-700">
          Product media in S3
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-brand-earth-900">
          Upload product images and videos without storing them in the repo
        </h2>
        <p className="mt-3 max-w-3xl text-brand-earth-700/80">
          Files are sent to the backend, uploaded to S3, and returned as permanent URLs you can save against products.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <div className="card-warm space-y-5">
          <div>
            <label htmlFor="productSlug" className="text-sm font-semibold text-brand-earth-900">
              Product slug
            </label>
            <input
              id="productSlug"
              value={productSlug}
              onChange={(event) => setProductSlug(event.target.value)}
              placeholder="mango-pickle"
              className="mt-2 w-full rounded-2xl border border-brand-cream-300 bg-white px-4 py-3 text-brand-earth-900 outline-none transition focus:border-brand-primary-400"
            />
            <p className="mt-2 text-sm text-brand-earth-700/75">
              Optional. Used only to group files under a cleaner S3 path.
            </p>
          </div>

          <div>
            <label htmlFor="mediaFile" className="text-sm font-semibold text-brand-earth-900">
              Image or video
            </label>
            <input
              id="mediaFile"
              type="file"
              accept="image/*,video/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="mt-2 block w-full rounded-2xl border border-dashed border-brand-cream-300 bg-white px-4 py-4 text-sm text-brand-earth-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-primary-700 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-brand-primary-800"
            />
            <p className="mt-2 text-sm text-brand-earth-700/75">
              Supported types: common web images plus MP4, WebM, MOV, and OGG video.
            </p>
          </div>

          {file && (
            <div className="rounded-2xl bg-brand-cream-50 px-4 py-4 ring-1 ring-brand-cream-200">
              <p className="font-semibold text-brand-earth-900">{file.name}</p>
              <p className="mt-1 text-sm text-brand-earth-700/80">
                {file.type || "Unknown type"} · {formatBytes(file.size)}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => void upload()}
            disabled={state.status === "uploading"}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.status === "uploading" ? "Uploading..." : "Upload to S3"}
          </button>

          {state.status === "error" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.message}
            </div>
          )}
        </div>

        <div className="card-warm space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">
              Result
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-brand-earth-900">
              Uploaded file details
            </h3>
          </div>

          {result ? (
            <>
              <div className="overflow-hidden rounded-3xl bg-brand-cream-100 ring-1 ring-brand-cream-200">
                {result.mediaType === "VIDEO" ? (
                  <video
                    src={result.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full max-h-[28rem] w-full object-cover"
                  >
                    Your browser does not support product video playback.
                  </video>
                ) : (
                  <img
                    src={result.url}
                    alt="Uploaded product media preview"
                    className="h-full max-h-[28rem] w-full object-cover"
                  />
                )}
              </div>

              <div className="space-y-3 rounded-2xl bg-brand-cream-50 px-4 py-4 ring-1 ring-brand-cream-200">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-earth-700/70">Media type</p>
                  <p className="mt-1 font-medium text-brand-earth-900">{result.mediaType}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-earth-700/70">Public URL</p>
                  <input readOnly value={result.url} className="mt-1 w-full rounded-xl border border-brand-cream-300 bg-white px-3 py-2 text-sm text-brand-earth-900" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-earth-700/70">S3 key</p>
                  <input readOnly value={result.key} className="mt-1 w-full rounded-xl border border-brand-cream-300 bg-white px-3 py-2 text-sm text-brand-earth-900" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-earth-700/70">Content type</p>
                    <p className="mt-1 text-sm text-brand-earth-900">{result.contentType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-earth-700/70">File size</p>
                    <p className="mt-1 text-sm text-brand-earth-900">{formatBytes(result.size)}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-cream-300 bg-white px-6 py-10 text-center text-brand-earth-700/80">
              Upload a file to receive its S3 URL and preview it here.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}