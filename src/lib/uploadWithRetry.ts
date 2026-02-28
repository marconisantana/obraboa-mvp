import { supabase } from '@/integrations/supabase/client';

interface UploadOptions {
  bucket: string;
  path: string;
  file: File;
  maxRetries?: number;
  upsert?: boolean;
}

export async function uploadWithRetry({
  bucket,
  path,
  file,
  maxRetries = 2,
  upsert = false,
}: UploadOptions): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert });

    if (!error) return;
    lastError = error;

    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  throw lastError;
}
