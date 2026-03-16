import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/styles';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { adjustPersonalInfo } from '@/lib/api';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const { user, checkAuth } = useAuth();
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone,
        email: user.email,
      });
    }
  }, [user]);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSavePersonalInfo = async () => {
    try {
      await adjustPersonalInfo(
        formData.name,
        formData.email,
        formData.phone,
        user?.skill ?? 5,
      );
      await checkAuth();
      setIsEditing(false);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit Info</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text style={styles.name}>{user?.name ?? ''}</Text>
            <Text style={styles.memberSince}>Member since {memberSince}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Email</Text>
            {!isEditing ? (
              <Text style={styles.infoValue}>{user?.email ?? ''}</Text>
            ) : (
              <TextInput
                style={styles.infoInput}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                keyboardType='email-address'
                autoCapitalize='none'
              />
            )}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Name</Text>
            {!isEditing ? (
              <Text style={styles.infoValue}>{user?.name ?? ''}</Text>
            ) : (
              <TextInput
                style={styles.infoInput}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
            )}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Phone</Text>
            {!isEditing ? (
              <Text style={styles.infoValue}>{user?.phone ?? ''}</Text>
            ) : (
              <TextInput
                style={styles.infoInput}
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                keyboardType='phone-pad'
              />
            )}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Password</Text>
            <TouchableOpacity style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Reset Password</Text>
            </TouchableOpacity>
          </View>

          {isEditing && (
            <TouchableOpacity
              style={styles.saveInfoButton}
              onPress={handleSavePersonalInfo}
            >
              <Text style={styles.saveInfoButtonText}>Save Info</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#3a7abf',
    padding: 24,
    paddingTop: 16,
    borderRadius: 16,
    margin: 16,
    alignItems: 'center',
  },
  editButton: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  memberSince: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
  },
  infoSection: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 32,
  },
  infoCard: {
    backgroundColor: '#e8eaed',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  infoInput: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    borderBottomWidth: 1,
    borderBottomColor: '#3a7abf',
    paddingVertical: 2,
  },
  resetButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#3a7abf',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 4,
  },
  resetButtonText: {
    color: '#3a7abf',
    fontSize: 14,
    fontWeight: '500',
  },
  saveInfoButton: {
    alignSelf: 'center',
    borderWidth: 1,
    backgroundColor: '#3a7abf',
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 15,
    marginTop: 4,
  },
  saveInfoButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
