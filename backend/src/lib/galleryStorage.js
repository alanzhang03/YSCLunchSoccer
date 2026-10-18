import { supabaseStorage } from './supabase.js';

const BUCKET = 'gallery';
const IMAGE_PATTERN = /\.(jpe?g|png|webp|gif)$/i;

export async function ensureGalleryBucket() {
  const { data } = await supabaseStorage.getBucket(BUCKET);
  if (data) return;
  const { error } = await supabaseStorage.createBucket(BUCKET, {
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  });
  if (error && !/already exists/i.test(error.message)) throw error;
}

export async function uploadGalleryImage(name, buffer, contentType) {
  const { error } = await supabaseStorage
    .from(BUCKET)
    .upload(name, buffer, {
      contentType,
      upsert: true,
      cacheControl: '31536000',
    });
  if (error) throw error;
}

export async function listGalleryImages() {
  const { data, error } = await supabaseStorage
    .from(BUCKET)
    .list('', { limit: 1000 });
  if (error) throw error;

  return data
    .filter((file) => IMAGE_PATTERN.test(file.name))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    )
    .map((file) => ({
      name: file.name,
      url: supabaseStorage.from(BUCKET).getPublicUrl(file.name).data
        .publicUrl,
    }));
}
