import { supabase } from './supabaseClient';
import { isAuthConfigured } from '../config/env';

// DEMO MODE: no password is verified and no email is sent. The session lives only in this browser.
const KEY = 'cinetale_demo_session';
const demoListeners = new Set();
const readDemo = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
const writeDemo = (u) => { try { u ? localStorage.setItem(KEY, JSON.stringify(u)) : localStorage.removeItem(KEY); } catch { /* storage blocked */ } demoListeners.forEach((f) => f(u)); };

const mapUser = (u) => u && { id: u.id, email: u.email, fullName: u.user_metadata?.full_name || '', username: u.user_metadata?.username || '', demo: false };
const fail = (error) => { if (error) throw new Error(error.message || 'Something went wrong. Please try again.'); };

export const authService = {
  isDemo: !isAuthConfigured,

  async getCurrentUser() {
    if (!supabase) return readDemo();
    const { data } = await supabase.auth.getSession();
    return mapUser(data.session?.user);
  },

  /** Returns an unsubscribe function. */
  onAuthChange(cb) {
    if (!supabase) { demoListeners.add(cb); return () => demoListeners.delete(cb); }
    const { data } = supabase.auth.onAuthStateChange((event, session) => cb(mapUser(session?.user), event));
    return () => data.subscription.unsubscribe();
  },

  async signUp({ fullName, username, email, password }) {
    if (!supabase) {
      writeDemo({ id: `demo-${username}`, email, fullName, username, demo: true });
      return { needsVerification: false, demo: true };
    }
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, username }, emailRedirectTo: `${window.location.origin}/login` } });
    fail(error);
    return { needsVerification: !data.session, demo: false };
  },

  async signIn({ email, password }) {
    if (!supabase) {
      writeDemo({ id: `demo-${email}`, email, fullName: email.split('@')[0], username: email.split('@')[0].replace(/\W/g, ''), demo: true });
      return { demo: true };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(/invalid login/i.test(error.message) ? 'Incorrect email or password.' : error.message);
    return { demo: false };
  },

  async signOut() {
    if (!supabase) return writeDemo(null);
    fail((await supabase.auth.signOut()).error);
  },

  async requestPasswordReset(email) {
    if (!supabase) return { demo: true };
    fail((await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })).error);
    return { demo: false };
  },

  async updatePassword(password) {
    if (!supabase) throw new Error('Password reset is unavailable in demo mode.');
    fail((await supabase.auth.updateUser({ password })).error);
  },
};
