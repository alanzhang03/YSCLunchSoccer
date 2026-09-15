export const PLAYER_POSITIONS = ['DEF', 'MID', 'FWD'];
export const ADMIN_POSITIONS = ['DEF', 'MID', 'FWD', 'ALL'];
export const DRAFT_POSITION_ORDER = ['FWD', 'DEF', 'MID', 'ALL'];
export const DEFAULT_POSITION = 'MID';

export const POSITION_LABELS = {
  DEF: 'Defender',
  MID: 'Midfielder',
  FWD: 'Forward',
  ALL: 'All',
};

export function getPlayerPosition(player) {
  const position = player?.user?.position || player?.position || null;
  if (!position) return null;
  return String(position).toUpperCase();
}
