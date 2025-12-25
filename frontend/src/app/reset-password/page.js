'use client';
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { requestPasswordReset } from '@/lib/auth';
import styles from './reset-password.module.scss';

const Page = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Reset Password</h1>
          {success ? (
            <div className={styles.successMessage}>
              <p>
                If an account with that email exists, a password reset link has
                been sent to your email address.
              </p>
              <p>
                Please check your inbox and click the link to reset your
                password.
              </p>
              <button
                className={styles.button}
                onClick={() => router.push('/login')}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  value={email}
                  type='email'
                  onChange={handleEmailChange}
                  required
                  placeholder='Enter your email address'
                />
                <p className={styles.hint}>
                  Enter the email address associated with your account and we'll
                  send you a link to reset your password.
                </p>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button
                type='submit'
                className={styles.button}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
          <div className={styles.link}>
            <Link href='/login'>Back to Login</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
