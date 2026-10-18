import { supabaseAdmin } from './supabase.js';

const BUCKET = 'avatars';
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

let bucketReady = null;

function ensureBucket() {
  if (!bucketReady) {
    bucketReady = (async () => {
      const { data } = await supabaseAdmin.storage.getBucket(BUCKET);
      if (data) return;
      const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_AVATAR_BYTES,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });
      if (error && !/already exists/i.test(error.message)) throw error;
    })().catch((error) => {
      bucketReady = null;
      throw error;
    });
  }
  return bucketReady;
}

export function detectImageType(buffer) {
  if (!buffer || buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

export async function uploadAvatar(userId, buffer, contentType) {
  await ensureBucket();

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(userId, buffer, {
      contentType,
      upsert: true,
      cacheControl: '31536000',
    });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(userId);

  return `${publicUrl}?v=${Date.now()}`;
}

export async function deleteAvatar(userId) {
  await ensureBucket();
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([userId]);
  if (error) throw error;
}
