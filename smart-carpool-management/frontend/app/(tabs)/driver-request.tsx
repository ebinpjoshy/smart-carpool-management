// app/(tabs)/driver-grouped-requests.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function DriverGroupedRequests() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState(null);

  // Pricing constants
  const BASE_FARE = 30;
  const RATE_PER_KM = 8;
  const AVG_DISTANCE = 12; // fallback — replace with real OSRM later
  const RIDER_SHARE = 0.6; // each rider pays 60% of full fare

  useEffect(() => {
    const loadGroups = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        Alert.alert("Error", "Not logged in");
        setLoading(false);
        return;
      }
      setDriverId(session.user.id);

      const { data: requests, error } = await supabase
        .from('ride_requests')
        .select('request_id, pickup_location, destination, seats_required')
        .eq('request_status', 'pending');

      if (error) {
        Alert.alert("Error", error.message);
        setLoading(false);
        return;
      }

      // Group by pickup + destination
      const groupsMap = new Map();

      requests.forEach(req => {
        const key = `${req.pickup_location}|||${req.destination}`;
        if (!groupsMap.has(key)) {
          groupsMap.set(key, {
            key,
            pickup: req.pickup_location,
            destination: req.destination,
            totalSeats: 0,
            riderCount: 0,
            requestIds: [], // consistent name
          });
        }

        const group = groupsMap.get(key);
        group.totalSeats += req.seats_required;
        group.riderCount += 1;
        group.requestIds.push(req.request_id);
      });

      // Calculate earnings
      const groupedArray = Array.from(groupsMap.values()).map(g => {
        const distanceKm = AVG_DISTANCE;
        const fullFare = BASE_FARE + distanceKm * RATE_PER_KM;
        const perRiderFare = Math.round(fullFare * RIDER_SHARE);
        const totalEarnings = perRiderFare * g.riderCount;

        return {
          ...g,
          distanceKm,
          perRiderFare,
          totalEarnings,
        };
      });

      setGroups(groupedArray);
      setLoading(false);
    };

    loadGroups();
  }, []);

  const acceptGroup = async (group) => {
    // Safety check to prevent map on undefined
    if (!group || !Array.isArray(group.requestIds) || group.requestIds.length === 0) {
      Alert.alert("Error", "Invalid group data - no requests found");
      console.log("Bad group:", group);
      return;
    }

    Alert.alert(
      "Accept Group?",
      `${group.pickup} → ${group.destination}\n` +
      `${group.riderCount} rider${group.riderCount > 1 ? 's' : ''}\n` +
      `${group.totalSeats} seat${group.totalSeats > 1 ? 's' : ''}\n` +
      `Each rider pays ≈ ₹${group.perRiderFare}\n` +
      `You earn: ₹${group.totalEarnings}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: async () => {
            try {
              // 1. Create ride
              const { data: ride, error: rideErr } = await supabase
                .from('rides')
                .insert({
                  driver_id: driverId,
                  ride_status: 'ongoing', // change to 'confirmed' if you allowed it
                  created_at: new Date().toISOString(),
                })
                .select('ride_id')
                .single();

              if (rideErr) throw rideErr;

              const rideId = ride.ride_id;

              // 2. Assign requests
              const assignments = group.requestIds.map(id => ({
                request_id: id,
                ride_id: rideId,
              }));

              const { error: assignErr } = await supabase
                .from('ride_assignments')
                .insert(assignments);

              if (assignErr) throw assignErr;

              // 3. Update request statuses
              const { error: updateErr } = await supabase
                .from('ride_requests')
                .update({ request_status: 'accepted' })
                .in('request_id', group.requestIds);

              if (updateErr) throw updateErr;

              Alert.alert(
                "Success",
                "Group accepted! Ride created.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      router.replace('/(tabs)/driver-home');
                    },
                  },
                ]
              );

              // Remove from UI
              setGroups(prev => prev.filter(g => g.key !== group.key));
            } catch (err) {
              console.error("Accept failed:", err);
              Alert.alert("Error", err.message || "Failed to accept group");
            }
          },
        },
      ]
    );
  };

  const renderGroup = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.routeRow}>
        <Ionicons name="location-sharp" size={24} color="#7C3AED" />
        <Text style={styles.route}>
          {item.pickup} → {item.destination}
        </Text>
      </View>

      <Text style={styles.stats}>
        {item.riderCount} rider{item.riderCount > 1 ? 's' : ''} • {item.totalSeats} seat{item.totalSeats > 1 ? 's' : ''}
      </Text>

      <Text style={styles.earnings}>
        Earnings: ₹{item.totalEarnings}
        {'\n'}
        <Text style={styles.earningsDetail}>(each rider ≈ ₹{item.perRiderFare})</Text>
      </Text>

      <TouchableOpacity style={styles.acceptBtn} onPress={() => acceptGroup(item)}>
        <Text style={styles.acceptText}>Accept Group</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color="#7C3AED" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Grouped Pending Requests</Text>

      {groups.length === 0 ? (
        <Text style={styles.empty}>No pending grouped requests</Text>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroup}
          keyExtractor={item => item.key}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B1120' },
  title: { fontSize: 26, fontWeight: '800', color: '#F8FAFC', textAlign: 'center', marginVertical: 20 },
  empty: { color: '#94A3B8', fontSize: 18, textAlign: 'center', marginTop: 60 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginHorizontal: 16, marginBottom: 16 },
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  route: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginLeft: 12, flex: 1 },
  stats: { color: '#94A3B8', fontSize: 16, marginBottom: 6 },
  earnings: { color: '#10B981', fontSize: 18, fontWeight: '700', marginVertical: 12 },
  earningsDetail: { fontSize: 14, color: '#94A3B8' },
  acceptBtn: { backgroundColor: '#7C3AED', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  acceptText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});