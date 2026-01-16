import fs from 'fs';
import path from 'path';
import GalleryClient from './GalleryClient';

export default function GalleryPage() {
  const galleryDir = path.join(process.cwd(), 'public/gallery');
  const images = fs.readdirSync(galleryDir).filter(img =>
    img.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  );

  return <GalleryClient images={images} />;
}
