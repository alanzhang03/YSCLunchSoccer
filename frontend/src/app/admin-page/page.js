'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchAllUsers, updateUser } from '@/lib/api';
import styles from './admin.module.scss';

const AdminPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.isAdmin) {
      loadUsers();
    }
  }, [user]);

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
    });
    setError('');
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

  const sortedUsers = [...users].sort((a, b) => {
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
            <h1>User Management</h1>
            <p>{users.length} registered users</p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {fetching ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
              <p>Loading users...</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
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
                          <td>
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
                          <td>
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
                          <td>
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
                          <td>
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
                          <td>
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
                          <td>
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
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
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
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.phone}</td>
                          <td>{u.skill}/10</td>
                          <td>
                            <span
                              className={
                                u.isAdmin ? styles.badgeAdmin : styles.badgeUser
                              }
                            >
                              {u.isAdmin ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td>
                            <span
                              className={
                                u.smsOptIn ? styles.badgeSms : styles.badgeUser
                              }
                            >
                              {u.smsOptIn ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              className={styles.editBtn}
                              onClick={() => startEdit(u)}
                            >
                              Edit
                            </button>
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
