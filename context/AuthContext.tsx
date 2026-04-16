import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import apiClient, { setUnauthorizedHandler } from "../api/client";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  sessionId: string | null;
  isLoading: boolean;
  isOnline: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // We define logout first so it can be used in useEffect
  async function logout() {
    try {
      await apiClient.get("/auth/logout");
    } catch (e) {
      console.warn("Auth: Logout API call failed", e);
    }
    await SecureStore.deleteItemAsync("sessionId");
    await SecureStore.deleteItemAsync("userData");
    setSessionId(null);
    setUser(null);
  }

  useEffect(() => {
    setUnauthorizedHandler(logout);
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const storedSessionId = await SecureStore.getItemAsync("sessionId");
      const storedUserData = await SecureStore.getItemAsync("userData");

      if (storedSessionId) {
        setSessionId(storedSessionId);

        // Load cached user data first (works offline)
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);

            setUser(userData);
          } catch (e) {
            console.warn("Auth: Failed to parse cached user data", e);
          }
        }

        // Try to refresh from server if online
        try {
          await fetchCurrentUser(storedSessionId);
        } catch (networkError) {
          setIsOnline(false);
        }
      }
    } catch (e) {
      console.error("Failed to load session", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCurrentUser(sid: string) {
    try {
      const response = await apiClient.get<any>("/auth/me");
      if (response.data) {
        // Backend returns { userId, email, fullName, role }
        const { userId, ...rest } = response.data;
        const userData = { id: userId || rest.id, ...rest };
        setUser(userData);

        // Cache user data for offline use
        await SecureStore.setItemAsync("userData", JSON.stringify(userData));
        setIsOnline(true);
      }
    } catch (e: any) {
      console.error("Failed to fetch user", e);
      setIsOnline(false);

      // Only logout on explicit auth errors, not network errors
      if (e.response?.status === 401 || e.response?.status === 403) {
        await logout();
      }
      // Re-throw network errors so loadSession can handle offline mode
      throw e;
    }
  }

  async function login(email: string, password: string) {
    const response = await apiClient.post<any>("/auth/login", {
      email,
      password,
    });
    const { user: userData, sessionId: sid } = response.data;

    await SecureStore.setItemAsync("sessionId", sid);
    await SecureStore.setItemAsync("userData", JSON.stringify(userData));
  }

  async function register(data: any) {
    const response = await apiClient.post<any>("/auth/register", data);
    const { user: userData, sessionId: sid } = response.data;

    await SecureStore.setItemAsync("sessionId", sid);
    await SecureStore.setItemAsync("userData", JSON.stringify(userData));
    setSessionId(sid);
    setUser(userData);
    setIsOnline(true);
  }

  async function refreshUser() {
    if (sessionId) {
      await fetchCurrentUser(sessionId);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionId,
        isLoading,
        isOnline,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
