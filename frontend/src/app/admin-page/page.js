'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  fetchAllUsers,
  updateUser,
  deleteUser,
  getDisclaimerInfo,
  setDisclaimerInfo,
} from '@/lib/api';
import styles from './admin.module.scss';

const AdminPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const [disclaimerEnabled, setDisclaimerEnabled] = useState(false);
  const [disclaimerMessage, setDisclaimerMessage] = useState('');
  const [disclaimerSaving, setDisclaimerSaving] = useState(false);
  const [disclaimerError, setDisclaimerError] = useState('');
  const [disclaimerSuccess, setDisclaimerSuccess] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.isAdmin) {
      loadUsers();
      loadDisclaimer();
    }
  }, [user]);

  const loadDisclaimer = async () => {
    try {
      const data = await getDisclaimerInfo();
      if (data) {
        setDisclaimerEnabled(data.enabled);
        setDisclaimerMessage(data.message);
      }
    } catch {
      // non-critical, fail silently
    }
  };

  const saveDisclaimer = async () => {
    try {
      setDisclaimerSaving(true);
      setDisclaimerError('');
      setDisclaimerSuccess(false);
      await setDisclaimerInfo(disclaimerEnabled, disclaimerMessage);
      setDisclaimerSuccess(true);
    } catch (err) {
      setDisclaimerError(err.message || 'Failed to save disclaimer');
    } finally {
      setDisclaimerSaving(false);
    }
  };

  const loadUsers = async () => {
    try {
      setFetching(true);
      const response = await fetchAllUsers();
      setUsers(response.users);
    } catch {
      setError('Failed to load users');
    } finally {
      setFetching(false);
    }
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditData({
      name: u.name,
      email: u.email,
      phone: u.phone,
      skill: u.skill,
      isAdmin: u.isAdmin,
      smsOptIn: u.smsOptIn,
      ogGroup: u.ogGroup,
      wedGroup: u.wedGroup,
    });
    setError('');
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete ${u.name} (${u.email})? This is permanent and they will need to re-register.`)) return;
    try {
      setDeleting(u.id);
      setError('');
      await deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setError('');
  };

  const saveEdit = async (userId) => {
    try {
      setSaving(true);
      setError('');
      const response = await updateUser(userId, editData);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? response.user : u)),
      );
      setEditingId(null);
      setEditData({});
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredUsers = searchQuery.trim()
    ? users.filter((u) => {
        const q = searchQuery.toLowerCase();
        return (
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.phone && u.phone.includes(q))
        );
      })
    : users;

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const sortIndicator = (key) =>
    sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  const sortOptions = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'skill', label: 'Skill' },
    { key: 'isAdmin', label: 'Admin' },
    { key: 'smsOptIn', label: 'SMS Opt-in' },
    { key: 'ogGroup', label: 'OG Group' },
    { key: 'wedGroup', label: 'Wed Group' },
    { key: 'createdAt', label: 'Joined' },
  ];

  if (loading || !user?.isAdmin) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Site Settings</h1>
            <p>Manage the homepage disclaimer</p>
          </div>

          <div className={styles.disclaimerSection}>
            <div className={styles.disclaimerToggleRow}>
              <label className={styles.toggleLabel}>
                <input
                  type='checkbox'
                  checked={disclaimerEnabled}
                  onChange={(e) => setDisclaimerEnabled(e.target.checked)}
                />
                Show disclaimer on homepage
              </label>
            </div>

            <textarea
              className={styles.disclaimerTextarea}
              placeholder='Enter disclaimer message...'
              value={disclaimerMessage}
              onChange={(e) => setDisclaimerMessage(e.target.value)}
              rows={6}
            />

            {disclaimerError && (
              <div className={styles.error}>{disclaimerError}</div>
            )}
            {disclaimerSuccess && (
              <div className={styles.success}>
                Disclaimer saved successfully.
              </div>
            )}

            <button
              className={styles.saveBtn}
              onClick={saveDisclaimer}
              disabled={disclaimerSaving}
            >
              {disclaimerSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className={`${styles.card} ${styles.secondCard}`}>
          <div className={styles.header}>
            <h1>User Management</h1>
            <p>{users.length} registered users</p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {!fetching && (
            <div className={styles.searchRow}>
              <input
                className={styles.searchInput}
                type='text'
                placeholder='Search by name, email, or phone...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery.trim() && (
                <span className={styles.searchCount}>
                  {sortedUsers.length} of {users.length} users
                </span>
              )}
            </div>
          )}

          {fetching ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
              <p>Loading users...</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <div className={styles.mobileSortRow}>
                <select
                  className={styles.select}
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      Sort: {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  type='button'
                  className={styles.sortDirBtn}
                  onClick={() =>
                    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
                  }
                >
                  {sortDir === 'asc' ? '▲ Asc' : '▼ Desc'}
                </button>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th
                      className={styles.sortable}
                      onClick={() => handleSort('name')}
                    >
                      Name{sortIndicator('name')}
                    </th>
                    <th
                      className={styles.sortable}
                      onClick={() => handleSort('email')}
                    >
                      Email{sortIndicator('email')}
                    </th>
                    <th
                      className={styles.sortable}
                      onClick={() => handleSort('phone')}
                    >
                      Phone{sortIndicator('phone')}
                    </th>
                    <th
                      className={styles.sortable}
                      onClick={() => handleSort('skill')}
                    >
                      Skill{sortIndicator('skill')}
                    </th>
                    <th
                      className={styles.sortable}
                      onClick={() => handleSort('isAdmin')}
                    >
                      Admin{sortIndicator('isAdmin')}
                    </th>
                    <th
                      className={styles.sortable}
                      onClick={() => handleSort('smsOptIn')}
                    >
                      SMS Opt-in{sortIndicator('smsOptIn')}
                    </th>
                    <th
                      className={styles.sortable}
                      onClick={() => handleSort('ogGroup')}
                    >
                      OG Group{sortIndicator('ogGroup')}
                    </th>
                    <th
                      className={styles.sortable}
                      onClick={() => handleSort('wedGroup')}
                    >
                      Wed Group{sortIndicator('wedGroup')}
                    </th>
                    <th
                      className={styles.sortable}
                      onClick={() => handleSort('createdAt')}
                    >
                      Joined{sortIndicator('createdAt')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((u) => (
                    <tr key={u.id}>
                      {editingId === u.id ? (
                        <>
                          <td data-label='Name' className={styles.nameCell}>
                            <input
                              className={styles.input}
                              value={editData.name}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  name: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td data-label='Email'>
                            <input
                              className={styles.input}
                              value={editData.email}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  email: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td data-label='Phone'>
                            <input
                              className={styles.input}
                              value={editData.phone}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  phone: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td data-label='Skill'>
                            <input
                              className={styles.input}
                              type='number'
                              min='1'
                              max='10'
                              value={editData.skill}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  skill: parseInt(e.target.value, 10) || '',
                                })
                              }
                            />
                          </td>
                          <td data-label='Admin'>
                            <select
                              className={styles.select}
                              value={editData.isAdmin ? 'true' : 'false'}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  isAdmin: e.target.value === 'true',
                                })
                              }
                            >
                              <option value='false'>No</option>
                              <option value='true'>Yes</option>
                            </select>
                          </td>
                          <td data-label='SMS Opt-in'>
                            <select
                              className={styles.select}
                              value={editData.smsOptIn ? 'true' : 'false'}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  smsOptIn: e.target.value === 'true',
                                })
                              }
                            >
                              <option value='false'>No</option>
                              <option value='true'>Yes</option>
                            </select>
                          </td>
                          <td data-label='OG Group'>
                            <select
                              className={styles.select}
                              value={editData.ogGroup ? 'true' : 'false'}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  ogGroup: e.target.value === 'true',
                                })
                              }
                            >
                              <option value='false'>No</option>
                              <option value='true'>Yes</option>
                            </select>
                          </td>
                          <td data-label='Wed Group'>
                            <select
                              className={styles.select}
                              value={editData.wedGroup ? 'true' : 'false'}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  wedGroup: e.target.value === 'true',
                                })
                              }
                            >
                              <option value='false'>No</option>
                              <option value='true'>Yes</option>
                            </select>
                          </td>
                          <td data-label='Joined'>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className={styles.actions}>
                            <button
                              className={styles.saveBtn}
                              onClick={() => saveEdit(u.id)}
                              disabled={saving}
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              className={styles.cancelBtn}
                              onClick={cancelEdit}
                              disabled={saving}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td data-label='Name' className={styles.nameCell}>
                            {u.name}
                          </td>
                          <td data-label='Email'>{u.email}</td>
                          <td data-label='Phone'>{u.phone}</td>
                          <td data-label='Skill'>{u.skill}/10</td>
                          <td data-label='Admin'>
                            <span
                              className={
                                u.isAdmin ? styles.badgeAdmin : styles.badgeUser
                              }
                            >
                              {u.isAdmin ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td data-label='SMS Opt-in'>
                            <span
                              className={
                                u.smsOptIn ? styles.badgeSms : styles.badgeUser
                              }
                            >
                              {u.smsOptIn ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td data-label='OG Group'>
                            <span
                              className={
                                u.ogGroup ? styles.badgeOg : styles.badgeUser
                              }
                            >
                              {u.ogGroup ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td data-label='Wed Group'>
                            <span
                              className={
                                u.wedGroup ? styles.badgeOg : styles.badgeUser
                              }
                            >
                              {u.wedGroup ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td data-label='Joined'>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className={styles.actions}>
                            <button
                              className={styles.editBtn}
                              onClick={() => startEdit(u)}
                            >
                              Edit
                            </button>
                            {!u.isAdmin && (
                              <button
                                className={styles.deleteBtn}
                                onClick={() => handleDelete(u)}
                                disabled={deleting === u.id}
                              >
                                {deleting === u.id ? 'Deleting...' : 'Delete'}
                              </button>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
