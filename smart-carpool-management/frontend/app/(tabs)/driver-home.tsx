import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function DriverDashboard() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Driver Dashboard</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(tabs)/driver-request')}
        >
          <Ionicons name="people-outline" size={40} color="#7C3AED" />
          <Text style={styles.cardTitle}>Grouped Ride Requests</Text>
          <Text style={styles.cardDesc}>View grouped requests by route and accept them to earn more</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} disabled>
          <Ionicons name="cash-outline" size={40} color="#7C3AED" />
          <Text style={styles.cardTitle}>My Earnings</Text>
          <Text style={styles.cardDesc}>View total earnings from completed rides</Text>
          <Text style={styles.comingSoon}>Coming Soon</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} disabled>
          <Ionicons name="car-outline" size={40} color="#7C3AED" />
          <Text style={styles.cardTitle}>Active Rides</Text>
          <Text style={styles.cardDesc}>Manage your ongoing rides</Text>
          <Text style={styles.comingSoon}>Coming Soon</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1120" },
  container: { padding: 20, alignItems: 'center' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: "#F8FAFC",
    marginBottom: 32,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: "#F8FAFC",
    marginTop: 12,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 16,
  },
  comingSoon: {
    color: "#6D28D9",
    fontSize: 14,
    fontWeight: '600',
  },
});