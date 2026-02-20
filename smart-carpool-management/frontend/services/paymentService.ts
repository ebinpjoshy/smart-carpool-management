import { supabase } from '../lib/supabase';

export async function createPayment(payload: any) {
  return supabase.from('payments').insert(payload);
}

export async function getPaymentsByRider(rider_id: string) {
  return supabase.from('payments').select('*').eq('rider_id', rider_id);
}
