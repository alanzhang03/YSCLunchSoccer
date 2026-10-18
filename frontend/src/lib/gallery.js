const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export function galleryUrl(name) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${name}`;
}

export async function getGalleryImages() {
  const response = await fetch(`${API_BASE_URL}/gallery`, {
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch gallery');
  }
  const { images } = await response.json();
  return images;
}
