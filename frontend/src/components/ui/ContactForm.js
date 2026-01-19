import React from 'react';
import styles from './ContactForm.module.scss';
import { sendEmail } from '@/lib/api';
import { useState } from 'react';

const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      await sendEmail({ name, email, message });
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.ContactFormContainer}>
      <h1>Contact Form</h1>
      {status === 'success' && (
        <p className={styles.successMessage}>Message sent successfully!</p>
      )}
      {status === 'error' && (
        <p className={styles.errorMessage}>
          Failed to send message. Please try again.
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <label htmlFor='name'>Name</label>
        <input
          name='name'
          id='name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label htmlFor='email'>Email</label>
        <input
          name='email'
          id='email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor='message'>Message</label>
        <textarea
          name='message'
          id='message'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
