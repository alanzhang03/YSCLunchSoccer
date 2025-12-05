"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getSessionById, sendMessage, getMessages } from "@/lib/api";
import SessionCard from "@/components/sessions/SessionCard";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./page.module.scss";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
    },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id;
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setMessagesLoading(true);
        const data = await getMessages(sessionId);
        setMessages(data);
      } catch (err) {
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    };

    if (sessionId) {
      fetchMessages();
    }
  }, [sessionId]);

  const handleSend = async () => {
    if (!text.trim() || !user) {
      return;
    }

    try {
      setSending(true);
      const newMessage = await sendMessage(sessionId, text);
      setMessages((prev) => [...prev, newMessage]);
      setText("");
    } catch (err) {
      alert(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const data = await getSessionById(sessionId);
        setSession(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const handleAttendanceUpdate = async () => {
    try {
      const data = await getSessionById(sessionId);
      setSession(data);
    } catch (err) {}
  };

  if (loading) {
    return (
      <motion.div
        className={styles.page}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.loading}>Loading session...</div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className={styles.page}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.error}>
          <p>Error: {error}</p>
          <a href="/sessions" className={styles.backLink}>
            ← Back to Sessions
          </a>
        </div>
      </motion.div>
    );
  }

  if (!session) {
    return (
      <motion.div
        className={styles.page}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.error}>
          <p>Session not found</p>
          <a href="/sessions" className={styles.backLink}>
            ← Back to Sessions
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.page}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <main className={styles.main}>
        <motion.div
          className={styles.header}
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          <a href="/sessions" className={styles.backLink}>
            ← Back to Sessions
          </a>
          <h1 className={styles.title}>Session Details</h1>
        </motion.div>

        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <SessionCard
            sessionData={session}
            onAttendanceUpdate={handleAttendanceUpdate}
          />
        </motion.div>
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <div className={styles.chatSection}>
            <div className={styles.chatHeader}>
              <h3 className={styles.chatTitle}>Chat</h3>
              <span className={styles.chatSubtitle}>Discuss this session</span>
            </div>

            <div className={styles.messagesContainer}>
              {messagesLoading ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyStateText}>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyStateText}>
                    No messages yet. Be the first to start the conversation!
                  </p>
                </div>
              ) : (
                <div className={styles.messagesList}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`${styles.message} ${
                        user && message.userId === user.id
                          ? styles.messageOwn
                          : ""
                      }`}
                    >
                      <div className={styles.messageHeader}>
                        <span className={styles.messageAuthor}>
                          {message.user.name}
                        </span>
                        <span className={styles.messageTime}>
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className={styles.messageContent}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.messageInputContainer}>
              <textarea
                className={styles.messageInput}
                placeholder={
                  user
                    ? "Type your message..."
                    : "Please log in to send a message"
                }
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!user || sending}
              />
              <button
                onClick={handleSend}
                className={styles.sendButton}
                disabled={!user || !text.trim() || sending}
              >
                <span>{sending ? "Sending..." : "Send"}</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}
