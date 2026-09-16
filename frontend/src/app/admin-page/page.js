'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  fetchAllUsers,
  updateUser,
  bulkUpdateUsers,
  deleteUser,
  getDisclaimerInfo,
  setDisclaimerInfo,
} from '@/lib/api';
import styles from './admin.module.scss';
import { ADMIN_POSITIONS, POSITION_LABELS } from '@/lib/positions';

const AdminPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editAll, setEditAll] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');
  const [drafts, setDrafts] = useState({});
  const [savingChanges, setSavingChanges] = useState(false);
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

  const originalFieldValue = (u, field) => {
    if (field === 'position') return u.position || '';
    return u[field];
  };

  const valuesEqual = (field, left, right) => {
    if (['isAdmin', 'smsOptIn', 'ogGroup', 'wedGroup'].includes(field)) {
      return Boolean(left) === Boolean(right);
    }
    if (field === 'skill') return Number(left) === Number(right);
    return String(left ?? '') === String(right ?? '');
  };

  const getValue = (u, field) => {
    if (drafts[u.id] && drafts[u.id][field] !== undefined) {
      return drafts[u.id][field];
    }
    return originalFieldValue(u, field);
  };

  const setValue = (u, field, value) => {
    setBulkSuccess('');
    const original = originalFieldValue(u, field);
    setDrafts((prev) => {
      const userDraft = { ...(prev[u.id] || {}) };
      if (valuesEqual(field, value, original)) {
        delete userDraft[field];
      } else {
        userDraft[field] = value;
      }
      const next = { ...prev };
      if (Object.keys(userDraft).length === 0) {
        delete next[u.id];
      } else {
        next[u.id] = userDraft;
      }
      return next;
    });
  };

  const isDirty = (u, field) => drafts[u.id]?.[field] !== undefined;
  const dirtyUserCount = Object.keys(drafts).length;

  const isRowEditing = (u) => {
    if (editAll) return true;
    if (editingId === u.id) return true;
    const draft = drafts[u.id];
    if (!draft) return false;
    return Object.keys(draft).some((key) => key !== 'position');
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setError('');
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete ${u.name} (${u.email})? This is permanent and they will need to re-register.`)) return;
    try {
      setDeleting(u.id);
      setError('');
      await deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[u.id];
        return next;
      });
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  const cancelEdit = (userId) => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
    if (editingId === userId) {
      setEditingId(null);
    }
    setError('');
  };

  const saveEdit = async (userId) => {
    const draft = drafts[userId];
    if (!draft || Object.keys(draft).length === 0) {
      setEditingId(null);
      return;
    }
    try {
      setSaving(true);
      setError('');
      const response = await updateUser(userId, draft);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? response.user : u)),
      );
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      setEditingId(null);
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const discardAllChanges = () => {
    setDrafts({});
    setEditingId(null);
    setEditAll(false);
    setBulkSuccess('');
    setError('');
  };

  const saveAllChanges = async () => {
    const updates = Object.entries(drafts).map(([id, fields]) => ({
      id,
      ...fields,
    }));
    if (!updates.length) return;

    const adminChanges = updates.filter((item) => item.isAdmin !== undefined);
    if (adminChanges.length) {
      const confirmed = window.confirm(
        `This will change admin status for ${adminChanges.length} user${
          adminChanges.length === 1 ? '' : 's'
        }. Continue?`,
      );
      if (!confirmed) return;
    }

    try {
      setSavingChanges(true);
      setError('');
      setBulkSuccess('');
      const response = await bulkUpdateUsers(updates);
      const updatedById = Object.fromEntries(
        (response.users || []).map((u) => [u.id, u]),
      );
      setUsers((prev) => prev.map((u) => updatedById[u.id] || u));
      setDrafts({});
      setEditingId(null);
      setBulkSuccess(
        `Saved changes for ${updates.length} user${
          updates.length === 1 ? '' : 's'
        }`,
      );
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSavingChanges(false);
    }
  };

  const renderPositionCell = (u) => (
    <td data-label='Position'>
      <select
        className={`${styles.select} ${
          isDirty(u, 'position') ? styles.dirtySelect : ''
        }`}
        value={getValue(u, 'position')}
        onChange={(e) => setValue(u, 'position', e.target.value)}
      >
        <option value=''>Unset</option>
        {ADMIN_POSITIONS.map((pos) => (
          <option key={pos} value={pos}>
            {POSITION_LABELS[pos]}
          </option>
        ))}
      </select>
    </td>
  );

  const renderYesNoSelect = (u, field) => (
    <select
      className={`${styles.select} ${isDirty(u, field) ? styles.dirtySelect : ''}`}
      value={getValue(u, field) ? 'true' : 'false'}
      onChange={(e) => setValue(u, field, e.target.value === 'true')}
    >
      <option value='false'>No</option>
      <option value='true'>Yes</option>
    </select>
  );

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
    { key: 'position', label: 'Position' },
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
          {bulkSuccess && <div className={styles.success}>{bulkSuccess}</div>}

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
              <div className={styles.bulkActions}>
                <button
                  type='button'
                  className={`${styles.editAllBtn} ${
                    editAll ? styles.editAllBtnActive : ''
                  }`}
                  onClick={() => {
                    setEditingId(null);
                    setEditAll((prev) => !prev);
                  }}
                >
                  {editAll ? 'Done editing all' : 'Edit all'}
                </button>
                <span className={styles.bulkHint}>
                  {dirtyUserCount > 0
                    ? `${dirtyUserCount} unsaved user${
                        dirtyUserCount === 1 ? '' : 's'
                      }`
                    : editAll
                      ? 'Edit any fields, then save all'
                      : 'Change positions, or turn on Edit all'}
                </span>
                <button
                  type='button'
                  className={styles.saveBtn}
                  onClick={saveAllChanges}
                  disabled={savingChanges || dirtyUserCount === 0}
                >
                  {savingChanges
                    ? 'Saving...'
                    : `Save all${
                        dirtyUserCount > 0 ? ` (${dirtyUserCount})` : ''
                      }`}
                </button>
                <button
                  type='button'
                  className={styles.cancelBtn}
                  onClick={discardAllChanges}
                  disabled={savingChanges || dirtyUserCount === 0}
                >
                  Discard
                </button>
              </div>
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
                      onClick={() => handleSort('position')}
                    >
                      Position{sortIndicator('position')}
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
                  {sortedUsers.map((u) => {
                    const rowEditing = isRowEditing(u);
                    return (
                    <tr
                      key={u.id}
                      className={drafts[u.id] ? styles.dirtyRow : ''}
                    >
                      {rowEditing ? (
                        <>
                          <td data-label='Name' className={styles.nameCell}>
                            <input
                              className={`${styles.input} ${
                                isDirty(u, 'name') ? styles.dirtySelect : ''
                              }`}
                              value={getValue(u, 'name') || ''}
                              onChange={(e) =>
                                setValue(u, 'name', e.target.value)
                              }
                            />
                          </td>
                          <td data-label='Email'>
                            <input
                              className={`${styles.input} ${
                                isDirty(u, 'email') ? styles.dirtySelect : ''
                              }`}
                              value={getValue(u, 'email') || ''}
                              onChange={(e) =>
                                setValue(u, 'email', e.target.value)
                              }
                            />
                          </td>
                          <td data-label='Phone'>
                            <input
                              className={`${styles.input} ${
                                isDirty(u, 'phone') ? styles.dirtySelect : ''
                              }`}
                              value={getValue(u, 'phone') || ''}
                              onChange={(e) =>
                                setValue(u, 'phone', e.target.value)
                              }
                            />
                          </td>
                          <td data-label='Skill'>
                            <input
                              className={`${styles.input} ${
                                isDirty(u, 'skill') ? styles.dirtySelect : ''
                              }`}
                              type='number'
                              min='1'
                              max='10'
                              value={getValue(u, 'skill')}
                              onChange={(e) =>
                                setValue(
                                  u,
                                  'skill',
                                  parseInt(e.target.value, 10) || '',
                                )
                              }
                            />
                          </td>
                          {renderPositionCell(u)}
                          <td data-label='Admin'>{renderYesNoSelect(u, 'isAdmin')}</td>
                          <td data-label='SMS Opt-in'>
                            {renderYesNoSelect(u, 'smsOptIn')}
                          </td>
                          <td data-label='OG Group'>
                            {renderYesNoSelect(u, 'ogGroup')}
                          </td>
                          <td data-label='Wed Group'>
                            {renderYesNoSelect(u, 'wedGroup')}
                          </td>
                          <td data-label='Joined'>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className={styles.actions}>
                            {editAll ? (
                              !u.isAdmin && (
                                <button
                                  className={styles.deleteBtn}
                                  onClick={() => handleDelete(u)}
                                  disabled={deleting === u.id}
                                >
                                  {deleting === u.id ? 'Deleting...' : 'Delete'}
                                </button>
                              )
                            ) : (
                              <>
                                <button
                                  className={styles.saveBtn}
                                  onClick={() => saveEdit(u.id)}
                                  disabled={saving || !drafts[u.id]}
                                >
                                  {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  className={styles.cancelBtn}
                                  onClick={() => cancelEdit(u.id)}
                                  disabled={saving}
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          <td data-label='Name' className={styles.nameCell}>
                            {getValue(u, 'name')}
                          </td>
                          <td data-label='Email'>{getValue(u, 'email')}</td>
                          <td data-label='Phone'>{getValue(u, 'phone')}</td>
                          <td data-label='Skill'>{getValue(u, 'skill')}/10</td>
                          {renderPositionCell(u)}
                          <td data-label='Admin'>
                            <span
                              className={
                                getValue(u, 'isAdmin')
                                  ? styles.badgeAdmin
                                  : styles.badgeUser
                              }
                            >
                              {getValue(u, 'isAdmin') ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td data-label='SMS Opt-in'>
                            <span
                              className={
                                getValue(u, 'smsOptIn')
                                  ? styles.badgeSms
                                  : styles.badgeUser
                              }
                            >
                              {getValue(u, 'smsOptIn') ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td data-label='OG Group'>
                            <span
                              className={
                                getValue(u, 'ogGroup')
                                  ? styles.badgeOg
                                  : styles.badgeUser
                              }
                            >
                              {getValue(u, 'ogGroup') ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td data-label='Wed Group'>
                            <span
                              className={
                                getValue(u, 'wedGroup')
                                  ? styles.badgeOg
                                  : styles.badgeUser
                              }
                            >
                              {getValue(u, 'wedGroup') ? 'Yes' : 'No'}
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
                    );
                  })}
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
