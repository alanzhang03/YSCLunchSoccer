import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { getSessions, attendSession } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/styles';

type Attendance = {
  id: string;
  status: string;
  user: { id: string; name: string; skill: number } | null;
};

type Session = {
  id: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  attendances: Attendance[];
};

export default function SessionsScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvping, setRsvping] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRsvp = async (
    sessionId: string,
    status: 'yes' | 'no' | 'maybe',
  ) => {
    setRsvping(sessionId + status);
    try {
      await attendSession(sessionId, status);
      await fetchSessions();
    } finally {
      setRsvping(null);
    }
  };

  const getMyStatus = (session: Session) => {
    if (!user) return null;
    const mine = session.attendances.find((a) => a.user?.id === user.id);
    return mine?.status ?? null;
  };

  const getYesCount = (session: Session) =>
    session.attendances.filter((a) => a.status === 'yes').length;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size='large'
          color='#3a7abf'
          style={{ marginTop: 40 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Upcoming Sessions</Text>

        {sessions.map((session) => {
          const myStatus = getMyStatus(session);
          const yesCount = getYesCount(session);
          return (
            <View key={session.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.dayOfWeek}>{session.dayOfWeek}</Text>
                  <Text style={styles.date}>{formatDate(session.date)}</Text>
                  <Text style={styles.time}>
                    {session.startTime} – {session.endTime}
                  </Text>
                </View>
                <View style={styles.countBubble}>
                  <Text style={styles.countNumber}>{yesCount}</Text>
                  <Text style={styles.countLabel}>going</Text>
                </View>
              </View>

              <View style={styles.rsvpRow}>
                {(['yes', 'no', 'maybe'] as const).map((status) => {
                  const isActive = myStatus === status;
                  const isLoading = rsvping === session.id + status;
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.rsvpButton,
                        isActive && styles.rsvpButtonActive,
                      ]}
                      onPress={() => handleRsvp(session.id, status)}
                      disabled={rsvping !== null}
                    >
                      <Text
                        style={[
                          styles.rsvpText,
                          isActive && styles.rsvpTextActive,
                        ]}
                      >
                        {isLoading
                          ? '...'
                          : status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}

        {sessions.length === 0 && (
          <Text style={styles.empty}>No upcoming sessions.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  pageTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  dayOfWeek: {
    color: '#93c5fd',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  date: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  time: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    marginTop: 4,
  },
  countBubble: {
    backgroundColor: '#3a7abf',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  countNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  countLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  rsvpRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rsvpButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rsvpButtonActive: {
    backgroundColor: '#3a7abf',
    borderColor: '#3a7abf',
  },
  rsvpText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  rsvpTextActive: {
    color: '#fff',
  },
  empty: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
