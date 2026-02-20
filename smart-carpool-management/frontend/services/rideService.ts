import { supabase } from '../lib/supabase';

export async function createRide(payload: any) {
  return supabase.from('rides').insert(payload);
}

export async function getUpcomingRides() {
  return supabase.from('rides').select('*').order('depart_at', { ascending: true });
}
