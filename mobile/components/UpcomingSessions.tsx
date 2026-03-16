import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionsByUser } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  yes: '#10b981',
  maybe: '#f59e0b',
  no: '#ef4444',
};

function formatDate(dateString: string, dayOfWeek?: string) {
  let sessionDate: Date;
  if (
    typeof dateString === 'string' &&
    dateString.match(/^\d{4}-\d{2}-\d{2}/)
  ) {
    const [year, month, day] = dateString.split('T')[0].split('-');
    sessionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else {
    sessionDate = new Date(dateString);
  }
  if (isNaN(sessionDate.getTime())) return { weekday: '', formattedDate: '' };

  const weekday = dayOfWeek
    ? dayOfWeek.toUpperCase()
    : sessionDate
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toUpperCase();
  const formattedDate = sessionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return { weekday, formattedDate };
}

export default function UpcomingSessions() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      getSessionsByUser()
        .then((data) => setSessions(data || []))
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (!user) return null;

  if (authLoading || loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Your Upcoming Sessions</Text>
        <ActivityIndicator color='#fff' />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Your Upcoming Sessions</Text>
        <Text style={styles.muted}>Error: {error}</Text>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Your Upcoming Sessions</Text>
        <Text style={styles.muted}>
          You haven't replied yes to any upcoming sessions yet.{' '}
          <Text style={styles.link} onPress={() => router.push('/sessions')}>
            Browse sessions
          </Text>
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Upcoming Sessions</Text>
      {sessions.map((session) => {
        const { weekday, formattedDate } = formatDate(
          session.date,
          session.dayOfWeek,
        );
        const time = `${session.startTime} - ${session.endTime} ${session.timezone}`;
        const status = session.attendances?.[0]?.status;
        return (
          <TouchableOpacity
            key={session.id}
            style={styles.sessionItem}
            onPress={() => router.push(`/sessions/${session.id}`)}
          >
            <View style={styles.sessionHeader}>
              <Text style={styles.weekday}>{weekday}</Text>
              {status && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: STATUS_COLORS[status] || '#6b7280' },
                  ]}
                >
                  <Text style={styles.badgeText}>{status.toUpperCase()}</Text>
                </View>
              )}
            </View>
            <Text style={styles.date}>{formattedDate}</Text>
            <Text style={styles.time}>{time}</Text>
            <Text style={styles.muted}>
              {session._count?.attendances ?? 0} attending
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  sessionItem: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  weekday: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  time: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  muted: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  link: {
    color: '#60a5fa',
    textDecorationLine: 'underline',
  },
});
