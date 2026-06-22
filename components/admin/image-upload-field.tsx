"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageUploadFieldProps = {
  name?: string;
  defaultUrl?: string | null;
  label: string;
  action: (formData: FormData) => Promise<void>;
  shape?: "square" | "circle" | "wide";
  hiddenFields?: Record<string, string>;
};

export function ImageUploadField({
  name = "file",
  defaultUrl,
  label,
  action,
  shape = "square",
  hiddenFields = {},
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(defaultUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set(name, file);
      Object.entries(hiddenFields).forEach(([k, v]) => fd.set(k, v));
      await action(fd);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreview(defaultUrl ?? "");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-kaizen-silver">{label}</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className={cn(
          "group relative overflow-hidden border-2 border-dashed border-blue/30 bg-kaizen-black transition-colors hover:border-gold/50",
          shape === "circle" && "h-32 w-32 rounded-full",
          shape === "square" && "h-40 w-40 rounded-xl",
          shape === "wide" && "h-48 w-full max-w-xl rounded-xl"
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-kaizen-muted">
            Click to upload
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="h-8 w-8 text-white" />
        </div>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-white">
            Uploading…
          </div>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
