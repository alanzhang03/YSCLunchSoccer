import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { colors } from '@/constants/styles';

const login = () => {
  return (
    <View style={styles.container}>
      <Text>login</Text>
    </View>
  );
};

export default login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
