'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '@/lib/auth';
import styles from './reset-password-token.module.scss';

const Page = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const router = useRouter();
  const params = useParams();
  const token = params?.token;

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Invalid reset link');
    }
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, newPassword);
      router.push('/login?reset=success');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      if (err.message?.includes('expired') || err.message?.includes('Invalid')) {
        setTokenValid(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Invalid Reset Link</h1>
          <p className={styles.error}>
            This password reset link is invalid or has expired. Please request a
            new password reset link.
          </p>
          <button
            className={styles.button}
            onClick={() => router.push('/reset-password')}
          >
            Request New Reset Link
          </button>
          <div className={styles.link}>
            <Link href='/login'>Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Set New Password</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>New Password</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  value={newPassword}
                  type={showPassword ? 'text' : 'password'}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder='Enter new password'
                  minLength={6}
                />
                <button
                  type='button'
                  className={styles.togglePassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <label>Confirm Password</label>
              <input
                value={confirmPassword}
                type={showPassword ? 'text' : 'password'}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder='Confirm new password'
                minLength={6}
              />
              <p className={styles.hint}>
                Password must be at least 6 characters long.
              </p>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type='submit' className={styles.button} disabled={loading}>
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
          <div className={styles.link}>
            <Link href='/login'>Back to Login</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;

