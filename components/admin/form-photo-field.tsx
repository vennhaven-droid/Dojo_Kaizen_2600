"use client";

import { useRef, useState } from "react";
import { PhotoPicker } from "@/components/admin/photo-picker";

type FormPhotoFieldProps = {
  name?: string;
  label?: string;
  shape?: "square" | "circle" | "wide";
};

/** Photo picker that attaches a file to a surrounding form — no URL input. */
export function FormPhotoField({
  name = "file",
  label = "Photo",
  shape = "circle",
}: FormPhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div>
      <PhotoPicker
        previewUrl={previewUrl}
        label={label}
        shape={shape}
        emptyText="Add photo"
        changeText="Change photo"
        onFileSelect={() => {}}
        fileInputRef={inputRef}
      />
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp,image/gif,image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setPreviewUrl(URL.createObjectURL(file));
        }}
      />
    </div>
  );
}
