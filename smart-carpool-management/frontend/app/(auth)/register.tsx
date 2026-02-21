import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import Modal from 'react-native-modal';
import { supabase } from '../../lib/supabase';
 // ← ADD THIS IMPORT

const CustomAlert = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');

  const show = (t, m, alertType = 'info') => {
    setTitle(t);
    setMessage(m);
    setType(alertType);
    setVisible(true);
  };

  const hide = () => setVisible(false);

  useImperativeHandle(ref, () => ({ show, hide }));

  const getColor = () => {
    switch (type) {
      case 'success': return '#10B981';
      case 'error':   return '#EF4444';
      default:        return '#7C3AED';
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={hide}
      onBackButtonPress={hide}
      animationIn="fadeInUp"
      animationOut="fadeOutDown"
      backdropOpacity={0.7}
      useNativeDriver
      style={styles.modal}
    >
   <Stack.Screen
  options={{
    headerShown: false,
  }}
/>
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 120}
        tint="dark"
        style={styles.alertContainer}
      >
        <View style={styles.alertContent}>
          <Text style={[styles.alertTitle, { color: getColor() }]}>
            {title}
          </Text>
          <Text style={styles.alertMessage}>{message}</Text>

          <TouchableOpacity
            style={[styles.alertButton, { backgroundColor: getColor() }]}
            onPress={hide}
            activeOpacity={0.8}
          >
            <Text style={styles.alertButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
});

// ────────────────────────────────────────────────
// Main Register Screen
// ────────────────────────────────────────────────
export default function Register() {
  const [role, setRole] = useState<'driver' | 'rider'>('rider');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [license, setLicense] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [capacity, setCapacity] = useState('');

  const alertRef = useRef(null);

  const showAlert = (title, message, type = 'info') => {
    alertRef.current?.show(title, message, type);
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      showAlert('Missing Fields', 'Please fill all required fields', 'error');
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        showAlert('Authentication Error', authError.message, 'error');
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        showAlert('Error', 'User ID not returned', 'error');
        return;
      }

      let successMessage = '';

      if (role === 'driver') {
        if (!license || !vehicleModel || !vehicleNumber || !capacity) {
          showAlert('Missing Fields', 'Please fill all driver fields', 'error');
          return;
        }

        const seating = Number(capacity);
        if (isNaN(seating)) {
          showAlert('Invalid Input', 'Seating capacity must be a number', 'error');
          return;
        }

        const { error: driverError } = await supabase.from('drivers').insert({
          driver_id: userId,
          name,
          email,
          phone,
          license_number: license,
        });

        if (driverError) {
          console.log('Driver Insert Error:', driverError);
          if (driverError.code === '23505' || driverError.message?.includes('duplicate')) {
            showAlert('Already Registered', 'This email is already in use. Try logging in.', 'error');
          } else {
            showAlert('Driver Registration Failed', driverError.message, 'error');
          }
          return;
        }

        const { error: vehicleError } = await supabase.from('vehicles').insert({
          driver_id: userId,
          vehicle_model: vehicleModel,
          vehicle_number: vehicleNumber,
          seating_capacity: seating,
        });

        if (vehicleError) {
          console.log('Vehicle Insert Error:', vehicleError);
          showAlert('Vehicle Registration Failed', vehicleError.message, 'error');
          return;
        }

        successMessage = 'Driver registered successfully!\nPlease verify your email before logging in.';
      } else {
        const { error } = await supabase.from('riders').insert({
          rider_id: userId,
          name,
          email,
          phone,
        });

        if (error) {
          console.log('Rider Insert Error:', error);
          if (error.code === '23505' || error.message?.includes('duplicate')) {
            showAlert('Already Registered', 'This email is already in use. Try logging in.', 'error');
          } else {
            showAlert('Registration Failed', error.message, 'error');
          }
          return;
        }

        successMessage = 'Registration successful!\nPlease verify your email before logging in.';
      }

      showAlert('Success', successMessage, 'success');

      // REDIRECT TO LOGIN AFTER SUCCESS (small delay so user sees alert)
      setTimeout(() => {
        router.replace('/');  // ← CHANGE TO YOUR ACTUAL LOGIN ROUTE if different (e.g. '/(auth)/login')
      }, 1400); // 1.8 seconds — adjust as needed

    } catch (err) {
      console.log('Unexpected Error:', err);
      showAlert('Unexpected Error', 'Something went wrong. Please try again.', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Title + Subtitle aligned top-left */}
          <Animated.View entering={FadeInDown.duration(700)}>
  <View style={styles.customHeader}>
    <TouchableOpacity onPress={() => router.back()}>
      <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
    </TouchableOpacity>

    <View style={styles.headerTextContainer}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>
        Register as {role === 'driver' ? 'Driver' : 'Rider'}
      </Text>
    </View>

    <View style={{ width: 24 }} />
  </View>
</Animated.View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, role === 'rider' && styles.toggleActive]}
              onPress={() => setRole('rider')}
            >
              <Text style={[styles.toggleText, role === 'rider' && styles.toggleTextActive]}>
                Rider
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleButton, role === 'driver' && styles.toggleActive]}
              onPress={() => setRole('driver')}
            >
              <Text style={[styles.toggleText, role === 'driver' && styles.toggleTextActive]}>
                Driver
              </Text>
            </TouchableOpacity>
          </View>

          <Animated.View
            entering={SlideInDown.duration(800).delay(200)}
            style={styles.card}
          >
            <BlurView
              intensity={Platform.OS === 'ios' ? 70 : 110}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.form}>
              <TextInput
                placeholder="Full Name"
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                placeholder="Email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                placeholder="Password"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                placeholder="Phone Number"
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#94A3B8"
              />

              {role === 'driver' && (
                <>
                  <TextInput
                    placeholder="License Number"
                    style={styles.input}
                    value={license}
                    onChangeText={setLicense}
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    placeholder="Vehicle Model"
                    style={styles.input}
                    value={vehicleModel}
                    onChangeText={setVehicleModel}
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    placeholder="Vehicle Number"
                    style={styles.input}
                    value={vehicleNumber}
                    onChangeText={setVehicleNumber}
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    placeholder="Seating Capacity"
                    style={styles.input}
                    keyboardType="numeric"
                    value={capacity}
                    onChangeText={setCapacity}
                    placeholderTextColor="#94A3B8"
                  />
                </>
              )}

              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>
                  Register as {role === 'driver' ? 'Driver' : 'Rider'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert ref={alertRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B1120' },
  container: { paddingHorizontal: 24, paddingVertical: 40 },

  // New: Container for top-left alignment
  headerContainer: {
    alignItems: 'flex-start', // ← left align
  },

  

  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    marginBottom: 25,
    padding: 4,
  },
  customHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 20,
},

headerTextContainer: {
  alignItems: 'center',
},

title: {
  fontSize: 26,
  fontWeight: '800',
  color: '#F8FAFC',
},

subtitle: {
  color: '#94A3B8',
  marginTop: 4,
},
  toggleButton: { flex: 1, paddingVertical: 12, borderRadius: 16, alignItems: 'center' },
  toggleActive: { backgroundColor: '#7C3AED' },
  toggleText: { color: '#94A3B8', fontWeight: '600', fontSize: 16 },
  toggleTextActive: { color: '#FFFFFF' },

  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 41, 59, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  form: { padding: 28 },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    color: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  button: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Alert styles (unchanged)
  modal: { justifyContent: 'center', margin: 0 },
  alertContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  alertContent: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  alertMessage: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
  },
  alertButton: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 16,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});