// app/(tabs)/driver-earnings.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

export default function DriverEarnings() {
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [rideCount, setRideCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState(null);

  useEffect(() => {
    const loadEarnings = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        Alert.alert("Error", "Not logged in");
        return;
      }
      setDriverId(session.user.id);

      const { data, error } = await supabase
        .from('rides')
        .select('final_fare')
        .eq('driver_id', session.user.id)
        .eq('ride_status', 'completed');

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        const earnings = data.reduce((sum, ride) => sum + (ride.final_fare || 0), 0);
        setTotalEarnings(earnings);
        setRideCount(data.length);
      }
      setLoading(false);
    };

    loadEarnings();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color="#7C3AED" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>My Earnings</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.total}>₹{totalEarnings.toLocaleString()}</Text>
          <Text style={styles.label}>Total Earnings</Text>
          <Text style={styles.detail}>
            From {rideCount} completed ride{rideCount !== 1 ? 's' : ''}
          </Text>
        </View>

        <Text style={styles.note}>
          Note: Earnings are based on final_fare in completed rides.
          {"\n"}Mark rides as completed to update this total.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B1120' },
  container: { padding: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#F8FAFC', marginBottom: 32 },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  total: { fontSize: 48, fontWeight: '900', color: '#10B981', marginBottom: 8 },
  label: { fontSize: 20, color: '#F8FAFC', marginBottom: 8 },
  detail: { fontSize: 16, color: '#94A3B8' },
  note: { color: '#94A3B8', fontSize: 14, textAlign: 'center' },
});