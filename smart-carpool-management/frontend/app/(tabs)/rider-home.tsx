import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
type TravelRequest = {
  id: string;
  pickup: string;
  dropoff: string;
  date: string;           // e.g. "12 Oct 2025"
  status: 'completed' | 'cancelled' | 'upcoming';
  amount?: number;        // in INR
};

// ────────────────────────────────────────────────
// Mock data – replace with Supabase later
// ────────────────────────────────────────────────
const mockMonthlyExpense = 2840;

const mockHistory: TravelRequest[] = [
  {
    id: 'tr-001',
    pickup: 'Edappally, Kochi',
    dropoff: 'Ernakulam South Railway Station',
    date: '18 Feb 2026',
    status: 'completed',
    amount: 420,
  },
  {
    id: 'tr-002',
    pickup: 'Lulu Mall',
    dropoff: 'Infopark Phase 1',
    date: '15 Feb 2026',
    status: 'completed',
    amount: 580,
  },
  {
    id: 'tr-003',
    pickup: 'Vyttila Mobility Hub',
    dropoff: 'Marine Drive',
    date: '10 Feb 2026',
    status: 'cancelled',
    amount: 0,
  },
  {
    id: 'tr-004',
    pickup: 'Cochin International Airport',
    dropoff: 'Fort Kochi',
    date: '5 Feb 2026',
    status: 'completed',
    amount: 1240,
  },
];

export default function RiderHome() {
  const [monthlyExpense, setMonthlyExpense] = useState(mockMonthlyExpense);
  const [history, setHistory] = useState<TravelRequest[]>(mockHistory);

  // TODO: Replace with real Supabase fetch
  useEffect(() => {
    // Example future implementation:
    // const fetchRiderData = async () => {
    //   const { data: { user } } = await supabase.auth.getUser();
    //   if (!user) return;
    //
    //   const { data: rides } = await supabase
    //     .from('ride_requests')
    //     .select('*, rides(final_fare)')
    //     .eq('rider_id', user.id)
    //     .order('created_at', { ascending: false })
    //     .limit(10);
    //
    //   // Calculate monthly total, map to history, etc.
    // };
    // fetchRiderData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      case 'upcoming':  return '#F59E0B';
      default:          return '#94A3B8';
    }
  };

  const renderHistoryItem = ({ item }: { item: TravelRequest }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyRoute}>
        <Ionicons name="location-sharp" size={20} color="#7C3AED" />
        <View style={styles.routeTextContainer}>
          <Text style={styles.routeFrom}>{item.pickup}</Text>
          <Text style={styles.routeTo}>→ {item.dropoff}</Text>
        </View>
      </View>

      <View style={styles.historyFooter}>
        <Text style={styles.historyDate}>{item.date}</Text>
        <View style={styles.rightFooter}>
          {item.amount ? (
            <Text style={styles.historyAmount}>₹{item.amount}</Text>
          ) : null}
          <Text style={[styles.historyStatus, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Greeting */}
        <Text style={styles.heading}>Welcome back, Rider</Text>

        {/* Monthly Spending Card */}
        <View style={styles.expenseCard}>
          <View style={styles.expenseHeader}>
            <Ionicons name="wallet-outline" size={28} color="#7C3AED" />
            <Text style={styles.expenseTitle}>This Month's Spending</Text>
          </View>
          <Text style={styles.expenseAmount}>₹{monthlyExpense.toLocaleString()}</Text>
          <Text style={styles.expenseSubtitle}>Spent on travel requests</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/create-request')}
          >
            <Ionicons name="add-circle-outline" size={32} color="#7C3AED" />
            <Text style={styles.actionText}>New Request</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/my-bookings')}
          >
            <Ionicons name="ticket-outline" size={32} color="#7C3AED" />
            <Text style={styles.actionText}>My Bookings</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Travels */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Travels</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/my-bookings')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-sport-outline" size={60} color="#4B5563" />
            <Text style={styles.emptyText}>No recent travels yet</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B1120' },
  container: { padding: 20, paddingBottom: 40 },

  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 24,
  },

  // Monthly Expense
  expenseCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.18)',
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  expenseTitle: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  expenseAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  expenseSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
  },

  // Quick Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.12)',
  },
  actionText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  seeAll: {
    color: '#7C3AED',
    fontSize: 15,
    fontWeight: '600',
  },

  // History Card
  historyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  historyRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  routeTextContainer: { flex: 1 },
  routeFrom: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  routeTo: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 2,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    color: '#94A3B8',
    fontSize: 13,
  },
  rightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyAmount: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  historyStatus: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 16,
  },
});