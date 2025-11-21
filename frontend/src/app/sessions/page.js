import styles from "./page.module.css";
import SessionList from "@/components/sessions/SessionList";

export default function SessionsPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Upcoming Sessions</h1>
          <div className={styles.titleUnderline}></div>
        </div>
        <SessionList />
      </main>
    </div>
  );
}
