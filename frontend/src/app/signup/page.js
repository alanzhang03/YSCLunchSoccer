'use client';
import React, { useState } from 'react';
import styles from './signup.module.scss';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const Page = () => {
  const [phoneNum, setPhoneNum] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
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
      await signup(phoneNum, email, name, password, skill);
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
              <label>Phone Number</label>
              <input
                value={phoneNum}
                onChange={handlePhoneNum}
                required
                placeholder='123-456-7890'
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
              <p className={styles.skillHint}>
                1 = Beginner, 3 = Casual pickup player, 5 = Solid pickup
                player, 7 = Strong club-level player, 10 = Elite (former or
                current semi-pro / pro)
              </p>
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
