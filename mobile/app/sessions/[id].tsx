import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSessionById, attendSession } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
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

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rsvping, setRsvping] = useState(false);

  const fetchSession = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSessionById(id);
      setSession(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [id]);

  const handleRsvp = async (status: 'yes' | 'no' | 'maybe') => {
    if (!session) return;
    setRsvping(true);
    try {
      await attendSession(session.id, status);
      await fetchSession();
    } finally {
      setRsvping(false);
    }
  };

  const myStatus =
    session && user
      ? (session.attendances.find((a) => a.user?.id === user.id)?.status ??
        null)
      : null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const yesAttendees =
    session?.attendances.filter((a) => a.status === 'yes') ?? [];
  const maybeAttendees =
    session?.attendances.filter((a) => a.status === 'maybe') ?? [];

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

  if (error || !session) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Session not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSession}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <Text style={styles.dayOfWeek}>{session.dayOfWeek}</Text>
          <Text style={styles.date}>{formatDate(session.date)}</Text>
          <Text style={styles.time}>
            {session.startTime} – {session.endTime}
          </Text>
        </View>

        <View style={styles.rsvpCard}>
          <Text style={styles.sectionTitle}>Your RSVP</Text>
          <View style={styles.rsvpRow}>
            {(['yes', 'no', 'maybe'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.rsvpButton,
                  myStatus === status && styles.rsvpButtonActive,
                ]}
                onPress={() => handleRsvp(status)}
                disabled={rsvping}
              >
                <Text
                  style={[
                    styles.rsvpText,
                    myStatus === status && styles.rsvpTextActive,
                  ]}
                >
                  {rsvping && myStatus !== status
                    ? '...'
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.attendeesCard}>
          <Text style={styles.sectionTitle}>Going ({yesAttendees.length})</Text>
          {yesAttendees.length === 0 ? (
            <Text style={styles.emptyText}>No one yet — be the first!</Text>
          ) : (
            yesAttendees.map((a) => (
              <View key={a.id} style={styles.attendeeRow}>
                <View style={styles.attendeeAvatar}>
                  <Text style={styles.attendeeInitial}>
                    {a.user?.name?.charAt(0).toUpperCase() ?? '?'}
                  </Text>
                </View>
                <Text style={styles.attendeeName}>
                  {a.user?.name ?? 'Unknown'}
                </Text>
                {/* <Text style={styles.attendeeSkill}>Skill {a.user?.skill ?? '?'}</Text> */}
              </View>
            ))
          )}
        </View>

        {maybeAttendees.length > 0 && (
          <View style={styles.attendeesCard}>
            <Text style={styles.sectionTitle}>
              Maybe ({maybeAttendees.length})
            </Text>
            {maybeAttendees.map((a) => (
              <View key={a.id} style={styles.attendeeRow}>
                <View
                  style={[styles.attendeeAvatar, styles.attendeeAvatarMaybe]}
                >
                  <Text style={styles.attendeeInitial}>
                    {a.user?.name?.charAt(0).toUpperCase() ?? '?'}
                  </Text>
                </View>
                <Text style={styles.attendeeName}>
                  {a.user?.name ?? 'Unknown'}
                </Text>
                <Text style={styles.attendeeSkill}>
                  Skill {a.user?.skill ?? '?'}
                </Text>
              </View>
            ))}
          </View>
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
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#93c5fd',
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
  },
  dayOfWeek: {
    color: '#93c5fd',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  date: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  time: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
  },
  rsvpCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
    paddingVertical: 10,
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
  attendeesCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    gap: 12,
  },
  attendeeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3a7abf',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendeeAvatarMaybe: {
    backgroundColor: '#4b5563',
  },
  attendeeInitial: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  attendeeName: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  attendeeSkill: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontStyle: 'italic',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    marginHorizontal: 24,
  },
  retryButton: {
    alignSelf: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#3a7abf',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#3a7abf',
    fontSize: 15,
  },
});
