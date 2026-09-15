export const PLAYER_POSITIONS = ['DEF', 'MID', 'FWD'];
export const ADMIN_POSITIONS = ['DEF', 'MID', 'FWD', 'ALL'];
export const DEFAULT_POSITION = 'MID';

export function normalizePlayerPosition(value, { required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    return required ? { ok: false } : { ok: true, position: DEFAULT_POSITION };
  }

  const position = String(value).trim().toUpperCase();
  if (PLAYER_POSITIONS.includes(position)) {
    return { ok: true, position };
  }

  return { ok: false };
}

export function normalizeAdminPosition(value) {
  if (value === undefined) {
    return { ok: true, omitted: true };
  }

  if (value === null || value === '') {
    return { ok: true, position: null };
  }

  const position = String(value).trim().toUpperCase();
  if (ADMIN_POSITIONS.includes(position)) {
    return { ok: true, position };
  }

  return { ok: false };
}
