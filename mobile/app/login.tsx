import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { colors } from '@/constants/styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login as loginfn } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

const login = () => {
  const { checkAuth } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await loginfn(identifier, password);
      await checkAuth();
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centered}>
        <View style={styles.card}>
          <Text style={styles.title}>Log In</Text>

          <Text style={styles.label}>Email or Phone Number</Text>
          <TextInput
            placeholder='Email or Phone Number'
            placeholderTextColor='#9ca3af'
            style={styles.input}
            onChangeText={setIdentifier}
            value={identifier}
            autoCapitalize='none'
            keyboardType='email-address'
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder='Password'
            placeholderTextColor='#9ca3af'
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>

          {/* DEV ONLY */}
          <TouchableOpacity style={styles.devButton} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.devButtonText}>Dev: Skip to App</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    width: '100%',
    maxWidth: 450,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1f73b7',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  devButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
  devButtonText: {
    color: '#9ca3af',
    fontSize: 13,
  },
});
