import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import GalleryClient from './GalleryClient';
import { getGalleryImages } from '@/lib/gallery';

export const revalidate = 300;

export default async function GalleryPage() {
  let images;
  try {
    images = await getGalleryImages();
  } catch (error) {
    if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) throw error;
    console.error('Failed to load gallery during build:', error);
    images = [];
  }

  return <GalleryClient images={images} />;
}
