import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "marketing-media";

export async function uploadMarketingMedia(file: File): Promise<string> {
  const admin = createAdminClient();
  if (!admin) throw new Error("Database not configured");

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
