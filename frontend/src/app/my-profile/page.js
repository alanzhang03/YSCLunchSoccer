'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from './my-profile.module.scss';
import { adjustPersonalInfo } from '@/lib/api';
import Link from 'next/link';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const MyProfilePage = () => {
  const { user, loading, checkAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    skill: '',
    email: '',
  });

  const router = useRouter();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone,
        skill: user.skill,
        email: user.email,
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const editingInfo = () => {
    setIsEditing(!isEditing);
  };

  const saveInfo = async () => {
    try {
      await adjustPersonalInfo(formData);
      await checkAuth();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <motion.div
          className={styles.profileCard}
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          <motion.div className={styles.header} variants={itemVariants}>
            <button className={styles.editButton} onClick={() => editingInfo()}>
              {isEditing ? 'Cancel' : 'Edit Info'}
            </button>
            <div className={styles.avatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h1>{user.name}</h1>
            <p className={styles.memberSince}>Member since {memberSince}</p>
          </motion.div>

          <motion.div className={styles.infoGrid} variants={itemVariants}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email</span>
              {isEditing ? (
                <input
                  type='email'
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={styles.input}
                />
              ) : (
                <span className={styles.value}>{user.email}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Name</span>
              {isEditing ? (
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={styles.input}
                />
              ) : (
                <span className={styles.value}>{user.name}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Phone</span>
              {isEditing ? (
                <input
                  type='tel'
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={styles.input}
                />
              ) : (
                <span className={styles.value}>{user.phone}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Password</span>
              <Link href="/reset-password" className={styles.resetPasswordLink}>
                Reset Password
              </Link>
            </div>
            {/*
            <div className={styles.infoItem}>
              <span className={styles.label}>Skill Level</span>
              {isEditing ? (
                <input
                  type='number'
                  min='1'
                  max='10'
                  value={formData.skill}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      skill: parseInt(e.target.value, 10) || '',
                    })
                  }
                  className={styles.input}
                />
              ) : (
                <span className={styles.value}>{user.skill} / 10</span>
              )}
            </div>
            */}
            {isEditing && (
              <button className={styles.saveButton} onClick={saveInfo}>
                Save Info
              </button>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default MyProfilePage;
