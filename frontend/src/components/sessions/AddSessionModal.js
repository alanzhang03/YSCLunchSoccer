import React from 'react';
import { useState } from 'react';
import styles from './AddSessionModal.module.scss';

const FIELDS = [
  { name: 'date', label: 'Date', type: 'date' },
  { name: 'dayOfWeek', label: 'Day of the Week', type: 'text' },
  { name: 'startTime', label: 'Start Time', type: 'time' },
  { name: 'endTime', label: 'End Time', type: 'time' },
];

const AddSessionModal = ({ retrieveNewSession, onClose, isSubmitting }) => {
  const [formData, setFormData] = useState({
    date: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    timezone: 'EST',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await retrieveNewSession(formData);
      setFormData({
        date: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        timezone: 'EST',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Create Session</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            type='button'
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {FIELDS.map(({ name, label, type }) => (
            <div key={name} className={styles.formGroup}>
              <label htmlFor={name}>{label}</label>
              <input
                id={name}
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
          ))}
          <div className={styles.formGroup}>
            <label htmlFor='timezone'>Timezone</label>
            <select
              id='timezone'
              name='timezone'
              value={formData.timezone}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value='EST'>EST</option>
              <option value='EDT'>EDT</option>
              <option value='PST'>PST</option>
              <option value='PDT'>PDT</option>
            </select>
          </div>
          <div className={styles.formActions}>
            <button
              type='button'
              onClick={onClose}
              disabled={isSubmitting}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSessionModal;
