import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const { ensureGalleryBucket, uploadGalleryImage } =
  await import('../src/lib/galleryStorage.js');

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node scripts/uploadGallery.js <folder>');
  process.exit(1);
}

const files = fs
  .readdirSync(dir)
  .filter((name) => CONTENT_TYPES[path.extname(name).toLowerCase()]);

if (files.length === 0) {
  console.error(`No images found in ${dir}`);
  process.exit(1);
}

await ensureGalleryBucket();

let failed = 0;
for (const name of files) {
  const contentType = CONTENT_TYPES[path.extname(name).toLowerCase()];
  try {
    await uploadGalleryImage(
      name,
      fs.readFileSync(path.join(dir, name)),
      contentType,
    );
    console.log(`uploaded ${name}`);
  } catch (error) {
    failed++;
    console.error(`FAILED ${name}: ${error.message}`);
  }
}

console.log(`\n${files.length - failed}/${files.length} uploaded`);
process.exit(failed ? 1 : 0);
