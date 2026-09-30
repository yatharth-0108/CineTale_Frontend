import { createClient } from '@supabase/supabase-js';
import { config, isAuthConfigured } from '../config/env';
// null in demo mode. Only the public anon key is used; access control is enforced by Row Level Security.
export const supabase = isAuthConfigured ? createClient(config.supabaseUrl, config.supabaseAnonKey) : null;
