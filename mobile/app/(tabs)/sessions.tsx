import { StyleSheet, Text, View } from 'react-native';

export default function SessionsScreen() {
  return (
    <View style={styles.container}>
      <Text>Sessions</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
