'use client';
import React, { useState, useRef, useEffect } from 'react';
import styles from './signup.module.scss';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';
import { resizeImageToAvatar } from '@/lib/avatar';
import { uploadAvatar } from '@/lib/api';
import { DEFAULT_POSITION, PLAYER_POSITIONS, POSITION_LABELS } from '@/lib/positions';

const Page = () => {
  const [phoneNum, setPhoneNum] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [name, setName] = useState('');
  const [skill, setSkill] = useState('5');
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const photoInputRef = useRef(null);
  const router = useRouter();
  const { signup, checkAuth } = useAuth();

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file');
      return;
    }

    try {
      setPhotoError('');
      const resized = await resizeImageToAvatar(file);
      setPhoto(resized);
      setPhotoPreview(URL.createObjectURL(resized));
    } catch (err) {
      setPhotoError(err.message || 'Could not use that image');
    }
  };

  const handlePhotoRemove = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoError('');
  };

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

      await signup(phoneNum, email, name, password, skill, true, position);

      // The account exists at this point, so a failed photo upload shouldn't
      // block signup; they can add one later from My Profile.
      if (photo) {
        try {
          await uploadAvatar(photo);
          await checkAuth();
        } catch (uploadError) {
          console.warn('Profile picture upload failed:', uploadError);
        }
      }

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
            <div className={styles.photoPicker}>
              <button
                type='button'
                className={`${styles.photoButton} ${
                  photoPreview ? styles.hasPhoto : ''
                }`}
                onClick={() => photoInputRef.current?.click()}
                aria-label={
                  photoPreview ? 'Change profile picture' : 'Add profile picture'
                }
              >
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt='' />
                ) : (
                  <Camera size={26} aria-hidden='true' />
                )}
              </button>
              <input
                ref={photoInputRef}
                type='file'
                accept='image/jpeg,image/png,image/webp,image/heic,image/heif'
                onChange={handlePhotoChange}
                hidden
              />
              <div className={styles.photoText}>
                <span className={styles.photoLabel}>
                  Profile picture <span>(optional)</span>
                </span>
                {photoPreview ? (
                  <span className={styles.photoActions}>
                    <button
                      type='button'
                      onClick={() => photoInputRef.current?.click()}
                    >
                      Change
                    </button>
                    <button type='button' onClick={handlePhotoRemove}>
                      Remove
                    </button>
                  </span>
                ) : (
                  <span className={styles.photoHint}>
                    Helps teammates recognize you
                  </span>
                )}
                {photoError && (
                  <span className={styles.photoError}>{photoError}</span>
                )}
              </div>
            </div>

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
              <label>Preferred position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                className={styles.positionSelect}
              >
                {PLAYER_POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {POSITION_LABELS[pos]}
                  </option>
                ))}
              </select>
              <label>Phone Number</label>
              <input
                value={phoneNum}
                onChange={handlePhoneNum}
                required
                placeholder='123-456-7890'
              />
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
