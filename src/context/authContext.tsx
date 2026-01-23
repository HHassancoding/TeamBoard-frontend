import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";
import type { User } from "../services/authService";
import { queryClient } from "../main";

/* ========== TYPES ========== */

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

/* ========== CONTEXT ========== */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ========== PROVIDER ========== */

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- LOGIN ---------- */
  const login = async (email: string, password: string) => {
  console.log("🔥 LOGIN FUNCTION CALLED", email, password);

  try {
    setLoading(true);

    console.log("➡️ calling authService.login");
    const response = await authService.login({ email, password });
    console.log("✅ login response", response);

    setToken(response.accessToken);

    // Clear cache to prevent showing previous user's data
    queryClient.clear();
    console.log("✅ cache cleared on login");

    console.log("➡️ calling /me");
    const user = await authService.getCurrentUser();
    console.log("✅ user", user);

    setUser(user);
  } catch (err: any) {
    console.error("❌ login failed", err);
    setError(err.message ?? "Login failed");
  } finally {
    setLoading(false);
  }
};


  /* ---------- LOGOUT ---------- */
  const logout = () => {
    authService.logout();
    queryClient.clear();
    console.log("✅ cache cleared on logout");
    setUser(null);
    setToken(null);
  };

  const clearError = () => setError(null);

  /* ---------- RESTORE SESSION ---------- */
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("accessToken");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        setToken(storedToken);
        const user = await authService.getCurrentUser();
        setUser(user);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, login, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ========== HOOK ========== */

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
