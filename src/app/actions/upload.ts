"use server";

import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a product image to Supabase Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadProductImage(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: "Invalid file type. Please use JPEG, PNG, WebP, or GIF." };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: "File too large. Maximum size is 5MB." };
    }

    const supabase = await createClient();

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME).getPublicUrl(fileName);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Delete a product image from Supabase Storage
 */
export async function deleteProductImage(
  url: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Extract file path from URL
    const bucketUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME}/`;
    if (!url.startsWith(bucketUrl)) {
      return { success: true }; // Not a Supabase storage URL, skip deletion
    }

    const filePath = url.replace(bucketUrl, "");

    const { error } = await supabase.storage
      .from(env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}
