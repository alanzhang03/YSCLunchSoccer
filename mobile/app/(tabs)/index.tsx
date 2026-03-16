import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import UpcomingSessions from '@/components/UpcomingSessions';

const MAPS_URL =
  'https://www.google.com/maps/place/YSC+Sports/@40.0773687,-75.4039779,1694m/data=!3m2!1e3!4b1!4m6!3m5!1s0x89c6945bbbf66627:0xc51da4623125fd8e!8m2!3d40.0773687!4d-75.4039779!16s%2Fg%2F1txnqdnh';

const FEATURES = [
  {
    title: 'Play together.',
    body: "Join your friends for lunchtime soccer. RSVP to sessions, see who's playing, and get ready for kickoff.",
  },
  {
    title: 'Stay organized.',
    body: "Teams get sorted automatically. See who's showing up in real-time. No more group chat chaos.",
  },
  {
    title: 'Build community.',
    body: 'Meet new people. Make new friends. Have fun!',
  },
];

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.background}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.title}>YSC Lunch Soccer</Text>
          <Text style={styles.subtitle}>
            Join your friends for lunchtime soccer sessions
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL(MAPS_URL)}>
            <Text style={styles.location}>
              📍 224 County Line Rd, Wayne, PA
            </Text>
          </TouchableOpacity>
          {!loading && user && (
            <Text style={styles.welcome}>
              Welcome back,{' '}
              <Text style={{ fontWeight: '700' }}>{user.name}</Text>!
            </Text>
          )}
          {!loading && !user && (
            <View style={styles.authButtons}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push('/login' as any)}
              >
                <Text style={styles.loginButtonText}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.signupButton}
                onPress={() => router.push('/signup' as any)}
              >
                <Text style={styles.signupButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <UpcomingSessions />

        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/sessions' as any)}
          >
            <Text style={styles.ctaButtonText}>View Sessions →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresSection}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureBody}>{f.body}</Text>
            </View>
          ))}
        </View>

        {!loading && !user && (
          <View style={styles.bottomCta}>
            <Text style={styles.bottomCtaHeading}>Ready to play?</Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/signup' as any)}
            >
              <Text style={styles.ctaButtonText}>Get started</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#1a2a3a',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  location: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  welcome: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  loginButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  signupButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  signupButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  ctaSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  ctaButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  featuresSection: {
    marginTop: 8,
    gap: 12,
  },
  featureCard: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  featureBody: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
  },
  bottomCta: {
    alignItems: 'center',
    marginTop: 32,
    gap: 16,
  },
  bottomCtaHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
});
