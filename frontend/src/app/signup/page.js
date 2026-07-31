'use client';
import React, { useState } from 'react';
import styles from './signup.module.scss';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const Page = () => {
  const [phoneNum, setPhoneNum] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [name, setName] = useState('');
  const [skill, setSkill] = useState('5');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  const handlePhoneNum = (e) => {
    setPhoneNum(e.target.value);
  };
  const handlePassword = (e) => {
    setPassword(e.target.value);
  };
  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleConfirmEmailChange = (e) => {
    setConfirmEmail(e.target.value);
  };
  const handleSkillChange = (e) => {
    const value = e.target.value;

    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 10)) {
      setSkill(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (email !== confirmEmail) {
        setError('Emails do not match');
        setLoading(false);
        return;
      }

      const digits = phoneNum.replace(/\D/g, '');
      if (digits.length !== 10) {
        setError('Phone number must be 10 digits');
        setLoading(false);
        return;
      }

      await signup(phoneNum, email, name, password, skill, smsOptIn);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Sign Up</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                value={name}
                onChange={handleNameChange}
                required
                placeholder='First and Last Name (e.g. John Doe)'
              />
              <label>Email</label>
              <input
                value={email}
                type='email'
                onChange={handleEmailChange}
                required
                placeholder='abc@example.com'
              />
              <label>Confirm Email</label>
              <input
                value={confirmEmail}
                type='email'
                onChange={handleConfirmEmailChange}
                required
                placeholder=''
              />
              {error === 'Emails do not match' && (
                <p className={styles.emailError}>{error}</p>
              )}
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
              <label>
                What would you say your soccer skill level is? (1-10)
              </label>
              <div className={styles.skillInputContainer}>
                <input
                  value={skill}
                  onChange={handleSkillChange}
                  type='range'
                  id='rating'
                  name='rating'
                  min='1'
                  max='10'
                  required
                  className={styles.skillSlider}
                />
                <input
                  value={skill}
                  onChange={handleSkillChange}
                  type='number'
                  min='1'
                  max='10'
                  required
                  className={styles.skillNumber}
                  aria-label='Skill level'
                />
              </div>
              <div className={styles.skillHint}>
                <div className={styles.skillScale}>
                  {[
                    ['1', 'Never played'],
                    ['3', 'Played a few times'],
                    ['5', 'Regular pickup'],
                    ['7', 'Competitive'],
                    ['10', 'Semi-pro / pro'],
                  ].map(([num, label]) => (
                    <div key={num} className={styles.skillScaleItem}>
                      <span className={styles.skillScaleNum}>{num}</span>
                      <span className={styles.skillScaleLabel}>{label}</span>
                    </div>
                  ))}
                </div>
                <p className={styles.skillWarning}>
                  Unsure? Put 4 or 5. Please be honest, inaccurate ratings
                  affect team balance. Honest ratings keep matches fair for
                  everyone.
                </p>
              </div>
              <label>Phone Number</label>
              <input
                value={phoneNum}
                onChange={handlePhoneNum}
                required
                placeholder='123-456-7890'
              />
              <label className={styles.smsOptIn}>
                <input
                  type='checkbox'
                  checked={smsOptIn}
                  onChange={(e) => setSmsOptIn(e.target.checked)}
                />
                I agree to receive text messages (teams and team color, deleted
                sessions, etc.).
              </label>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type='submit' className={styles.button} disabled={loading}>
              {loading ? 'Signing up...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Page;
