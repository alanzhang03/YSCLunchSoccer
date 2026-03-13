import { StyleSheet, Text, View, TextInput } from 'react-native';
import React from 'react';
import { colors } from '@/constants/styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

const login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.infoContainer}>
        <Text>login</Text>
        <TextInput
          placeholder='Email or Phone Number'
          style={styles.input}
          onChangeText={setIdentifier}
          value={identifier}
        />
        <TextInput
          placeholder='Password'
          style={styles.input}
          onChangeText={setPassword}
          value={password}
        />
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
  infoContainer: {
    borderRadius: 8,
  },
  input: {
    borderRadius: 8,
  },
});
