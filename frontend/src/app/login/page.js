'use client';
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from './login.module.scss';

const Page = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(identifier, password, rememberMe);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleIdentifier = (e) => {
    setIdentifier(e.target.value);
  };
  const handlePassword = (e) => {
    setPassword(e.target.value);
  };
  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Login</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Email or Phone Number</label>
              <input
                value={identifier}
                onChange={handleIdentifier}
                required
                placeholder='Email or phone number (e.g. user@example.com or 123-456-7890)'
              />
              <label>Password</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  value={password}
                  type={showPassword ? 'text' : 'password'}
                  onChange={handlePassword}
                  required
                  placeholder='Password'
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
              <div className={styles.rememberMe}>
                <label className={styles.checkboxLabel}>
                  <input
                    type='checkbox'
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type='submit' className={styles.button} disabled={loading}>
              {loading ? 'Logging in...' : 'Submit'}
            </button>
          </form>
          <div className={styles.link}>
            <Link href='/reset-password'>Forgot Password?</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
