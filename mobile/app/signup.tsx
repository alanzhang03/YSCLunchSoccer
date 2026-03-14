import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { colors } from '@/constants/styles';
import Slider from '@react-native-community/slider';
import { signup as signupFn } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

const signup = () => {
  const [phoneNum, setPhoneNum] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [skill, setSkill] = useState(5);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { checkAuth } = useAuth();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await signupFn(name, email, phoneNum, password, skill);
      await checkAuth();
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.centered}>
        <View style={styles.card}>
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.label}>Name</Text>
          <TextInput
            placeholder='First and Last Name (e.g. John Doe)'
            placeholderTextColor='#9ca3af'
            style={styles.input}
            onChangeText={setName}
            value={name}
            autoCapitalize='words'
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder='abc@example.com'
            placeholderTextColor='#9ca3af'
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            autoCapitalize='none'
            keyboardType='email-address'
          />
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            placeholder='123-456-7890'
            placeholderTextColor='#9ca3af'
            style={styles.input}
            onChangeText={setPhoneNum}
            value={phoneNum}
            autoCapitalize='none'
            keyboardType='phone-pad'
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder='Password'
            placeholderTextColor='#9ca3af'
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            autoCapitalize='none'
            secureTextEntry={!showPassword}
          />
          <Text style={styles.label}>
            What would you say your soccer skill level is? (1-10)
          </Text>
          <Slider
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={skill}
            onValueChange={(value) => setSkill(value)}
            minimumTrackTintColor='#4a90d9'
            maximumTrackTintColor='#555'
            thumbTintColor='#4a90d9'
          />
          <Text style={styles.skillValue}>{skill}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 32,
    borderRadius: 12,
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
  skillValue: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4a90d9',
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
});
