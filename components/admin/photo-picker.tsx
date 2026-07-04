"use client";

import { useRef, useState, useEffect, type RefObject } from "react";
import { Camera, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

export type PhotoPickerShape = "square" | "circle" | "wide" | "add";

type PhotoPickerProps = {
  previewUrl?: string | null;
  label?: string;
  shape?: PhotoPickerShape;
  loading?: boolean;
  error?: string;
  saved?: boolean;
  emptyText?: string;
  changeText?: string;
  disabled?: boolean;
  onFileSelect: (file: File) => void;
  /** When set, the picker triggers this input instead of its own (for HTML forms). */
  fileInputRef?: RefObject<HTMLInputElement | null>;
};

export function PhotoPicker({
  previewUrl,
  label,
  shape = "square",
  loading = false,
  error,
  saved,
  emptyText = "Add photo",
  changeText = "Change photo",
  disabled = false,
  onFileSelect,
  fileInputRef,
}: PhotoPickerProps) {
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = fileInputRef ?? internalInputRef;
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const displayUrl = localPreview ?? previewUrl ?? "";

  function pickFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setLocalPreview(URL.createObjectURL(file));
    onFileSelect(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) pickFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) pickFile(file);
  }

  const isAdd = shape === "add";

  return (
    <div className={cn("space-y-2", shape === "circle" && "mx-auto w-fit max-w-full")}>
      {(label || saved) && (
        <div className="flex items-center justify-between gap-2">
          {label && <p className="text-sm font-medium text-kaizen-silver">{label}</p>}
          {saved && <span className="text-xs font-medium text-green-400">Saved</span>}
        </div>
      )}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={disabled ? undefined : handleDrop}
        className={cn(dragOver && "rounded-xl ring-2 ring-gold/50")}
      >
        <button
          type="button"
          onClick={() => !disabled && inputRef.current?.click()}
          disabled={disabled || loading}
          aria-label={displayUrl ? changeText : emptyText}
          className={cn(
            "group relative w-full overflow-hidden border-2 border-dashed transition-colors",
            isAdd
              ? "flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-xl border-blue/30 bg-kaizen-black/50 hover:border-gold/50 hover:bg-kaizen-black"
              : "border-blue/30 bg-kaizen-black hover:border-gold/50",
            shape === "circle" && "h-36 w-36 rounded-full",
            shape === "square" && "aspect-square max-w-[12rem] rounded-xl",
            shape === "wide" && "aspect-[2/1] max-w-xl rounded-xl",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          {displayUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayUrl} alt="" className="h-full w-full object-cover" />
              {!isAdd && (
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-3 py-3 pt-8">
                  <Camera className="h-4 w-4 shrink-0 text-white" />
                  <span className="text-sm font-medium text-white">{changeText}</span>
                </div>
              )}
              {isAdd && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Camera className="h-8 w-8 text-white" />
                  <span className="text-sm font-medium text-white">{changeText}</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 py-6 text-center text-kaizen-muted">
              <ImagePlus className="h-8 w-8 text-gold/80" />
              <span className="text-sm font-medium text-kaizen-silver">{emptyText}</span>
              <span className="text-xs">Tap to choose from your device</span>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-sm font-medium text-white">
              Uploading…
            </div>
          )}
        </button>
      </div>
      {!fileInputRef && (
        <input
          ref={internalInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/*"
          className="hidden"
          onChange={handleChange}
        />
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
