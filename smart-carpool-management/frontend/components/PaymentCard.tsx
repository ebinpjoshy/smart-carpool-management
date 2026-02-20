import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PaymentCard({ amount, status }: { amount: number; status: string }) {
  return (
    <View style={styles.card}>
      <Text>Amount: ${amount.toFixed(2)}</Text>
      <Text>Status: {status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 8 }
});
