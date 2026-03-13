import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { colors } from '@/constants/styles';
const signup = () => {
  return (
    <View style={styles.container}>
      <Text>signup</Text>
    </View>
  );
};

export default signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
