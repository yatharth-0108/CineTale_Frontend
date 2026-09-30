import { supabase } from './supabaseClient';

const localKey = (id) => `cinetale_prefs_${id}`;
const DEMO_PEOPLE = [
  { id: 'demo-u1', name: 'Sample Reviewer A', username: 'sample_a' },
  { id: 'demo-u2', name: 'Sample Reviewer B', username: 'sample_b' },
  { id: 'demo-u3', name: 'Sample Reviewer C', username: 'sample_c' },
];

export const userService = {
  async getPreferences(user) {
    if (user.demo || !supabase) {
      try {
        return JSON.parse(localStorage.getItem(localKey(user.id)));
      } catch {
        return null;
      }
    }
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw new Error("Could not load your preferences.");
    return data;
  },

  /** prefs: { genres, likedMovieIds, dislikedMovieIds, moods, followedIds } */

  async savePreferences(user, prefs) {
    const row = {
      ...prefs,
      onboardedAt: new Date().toISOString(),
    };

    if (user.demo || !supabase) {
      localStorage.setItem(localKey(user.id), JSON.stringify(row));
      return row;
    }

    const { error } = await supabase.from("user_preferences").upsert({
      user_id: user.id,
      genres: prefs.genres,
      liked_movie_ids: prefs.likedMovieIds,
      disliked_movie_ids: prefs.dislikedMovieIds,
      moods: prefs.moods,
      followed_ids: prefs.followedIds ?? [],
      onboarded_at: row.onboardedAt,
    });

    if (error) {
      console.error("savePreferences error:", error);
      throw new Error("Could not save your preferences. Please try again.");
    }

    return row;
  },

  async getSuggestedUsers(user) {
    if (user.demo || !supabase) return { people: DEMO_PEOPLE, demo: true };
    return { people: [], demo: false }; // TODO(phase 5): query real suggestions
  },

  async isUsernameAvailable(username) {
    if (!supabase) return true;
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    return !data;
  },
};
