import Image from "next/image";
import styles from "./page.module.css";
import SessionCard from "@/components/sessions/SessionCard";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to YSC Lunch Soccer!</h1>
        <SessionCard />
      </main>
    </div>
  );
}
