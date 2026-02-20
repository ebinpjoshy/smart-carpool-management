import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RideRequest } from '../types/RideRequest';

export default function RequestCard({ request }: { request: RideRequest }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{request.pickup_location} → {request.destination}</Text>
      <Text>Status: {request.request_status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 8 },
  title: { fontWeight: '600' }
});
