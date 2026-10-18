import styles from './Avatar.module.scss';
import { getInitials, avatarColor } from '@/lib/avatar';

export default function Avatar({ user, size = 32, className = '' }) {
  const name = user?.name ?? '';

  return (
    <span
      className={`${styles.avatar} ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundColor: user?.avatarUrl ? undefined : avatarColor(user?.id),
      }}
      title={name}
      aria-hidden='true'
    >
      {user?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatarUrl} alt='' loading='lazy' />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
