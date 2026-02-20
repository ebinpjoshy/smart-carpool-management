import { supabase } from '../lib/supabase';

export async function createRequest(payload: any) {
  return supabase.from('ride_requests').insert(payload);
}

export async function getRequestsByRider(rider_id: string) {
  return supabase.from('ride_requests').select('*').eq('rider_id', rider_id);
}
