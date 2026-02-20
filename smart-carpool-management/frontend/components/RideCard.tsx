import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ride } from '../types/Ride';

export default function RideCard({ ride }: { ride: Ride }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{ride.origin} → {ride.destination}</Text>
      <Text>{new Date(ride.created_at).toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 8 },
  title: { fontWeight: '600' }
});
