"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhotoPicker } from "@/components/admin/photo-picker";

type AddPhotoCardProps = {
  label: string;
  action: (formData: FormData) => Promise<void>;
  hiddenFields?: Record<string, string>;
};

export function AddPhotoCard({ label, action, hiddenFields = {} }: AddPhotoCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function uploadFile(file: File) {
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const fd = new FormData();
      fd.set("file", file);
      Object.entries(hiddenFields).forEach(([k, v]) => fd.set(k, v));
      await action(fd);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
    setLoading(false);
  }

  return (
    <PhotoPicker
      label={label}
      shape="add"
      loading={loading}
      error={error}
      saved={saved}
      emptyText="Add photo"
      changeText="Upload another"
      onFileSelect={uploadFile}
    />
  );
}
