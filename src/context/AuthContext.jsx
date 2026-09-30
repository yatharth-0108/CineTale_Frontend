import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";

import { authService } from "../services/authService";
import { userService } from "../services/userService";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [onboarded, setOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);

  const hydrationId = useRef(0);

  const hydrate = useCallback(async (u) => {
    const requestId = ++hydrationId.current;

    // Keep protected routes waiting while preferences load.
    setLoading(true);

    try {
      if (!u) {
        if (requestId !== hydrationId.current) return;

        setUser(null);
        setOnboarded(false);
        return;
      }

      const prefs = await userService.getPreferences(u);

      // Ignore outdated requests, such as a previous login.
      if (requestId !== hydrationId.current) return;

      setUser(u);
      setOnboarded(Boolean(prefs?.onboardedAt ?? prefs?.onboarded_at));
    } catch (error) {
      if (requestId !== hydrationId.current) return;

      console.error("Could not hydrate user preferences:", error);

      setUser(u);
      setOnboarded(false);
    } finally {
      if (requestId === hydrationId.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let live = true;

    const off = authService.onAuthChange((u, event) => {
      if (!live) return;

      if (event === "PASSWORD_RECOVERY") {
        setRecovery(true);
      } else if (event === "SIGNED_IN") {
        setRecovery(false);
      }

      void hydrate(u);
    });

    authService
      .getCurrentUser()
      .then((u) => {
        if (live) void hydrate(u);
      })
      .catch((error) => {
        if (!live) return;

        console.error("Could not restore the current user:", error);
        setUser(null);
        setOnboarded(false);
        setLoading(false);
      });

    return () => {
      live = false;
      hydrationId.current += 1;
      off();
    };
  }, [hydrate]);

  const value = useMemo(
    () => ({
      user,
      loading,
      onboarded,
      recovery,
      isDemo: authService.isDemo,
      markOnboarded: () => setOnboarded(true),
      signOut: () => authService.signOut(),
    }),
    [user, loading, onboarded, recovery],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
