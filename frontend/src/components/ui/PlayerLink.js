import Link from 'next/link';
import styles from './PlayerLink.module.scss';

export default function PlayerLink({ userId, className = '', children }) {
  if (!userId) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      href={`/players/${userId}`}
      className={`${styles.link} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </Link>
  );
}
