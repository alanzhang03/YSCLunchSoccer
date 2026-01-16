'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.scss';

export default function GalleryClient({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Gallery</h1>
          <p>Memories from our soccer sessions</p>
        </motion.div>

        <motion.div
          className={styles.gallery}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {images.map((img, index) => (
            <motion.div
              key={img}
              className={styles.imageWrapper}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => setSelectedImage({ src: `/gallery/${img}`, index })}
            >
              <Image
                src={`/gallery/${img}`}
                alt={`Gallery image ${index + 1}`}
                width={400}
                height={300}
                className={styles.image}
                style={{ objectFit: 'cover' }}
              />
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence>
          {selectedImage && (
            <motion.div
              className={styles.lightbox}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                className={styles.lightboxContent}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={styles.closeButton}
                  onClick={() => setSelectedImage(null)}
                  aria-label="Close"
                >
                  ×
                </button>
                <Image
                  src={selectedImage.src}
                  alt={`Gallery image ${selectedImage.index + 1}`}
                  width={1200}
                  height={900}
                  className={styles.lightboxImage}
                  style={{ objectFit: 'contain' }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
