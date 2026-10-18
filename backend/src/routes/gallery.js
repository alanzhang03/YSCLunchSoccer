import { Router } from 'express';
import redis from '../lib/redis.js';
import { listGalleryImages } from '../lib/galleryStorage.js';

const router = Router();

const CACHE_KEY = 'gallery:images';
const CACHE_SECONDS = 300;

router.get('/', async (req, res) => {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return res.json({ images: JSON.parse(cached) });
    }

    const images = await listGalleryImages();
    await redis.setex(CACHE_KEY, CACHE_SECONDS, JSON.stringify(images));
    res.json({ images });
  } catch (error) {
    console.error('Fetch gallery error:', error);
    res.status(500).json({ error: 'Failed to load gallery' });
  }
});

export default router;
