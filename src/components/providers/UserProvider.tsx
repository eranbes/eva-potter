'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

interface User {
  id: string;
  firstName: string;
  totalPoints: number;
}

interface UserContextValue {
  user: User | null;
  loading: boolean;
  updatePoints: (newTotal: number) => void;
  setUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    // Check localStorage first to avoid a 401 console error for new visitors
    const storedId = typeof window !== 'undefined'
      ? localStorage.getItem('eva_potter_user_id')
      : null;

    if (!storedId) {
      // No user stored — skip the API call entirely
      setUserState(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setUserState({
          id: data.user.id,
          firstName: data.user.firstName,
          totalPoints: data.user.totalPoints,
        });
      } else {
        setUserState(null);
      }
    } catch {
      setUserState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updatePoints = useCallback((newTotal: number) => {
    setUserState((prev) => (prev ? { ...prev, totalPoints: newTotal } : null));
  }, []);

  const setUser = useCallback((newUser: User) => {
    setUserState(newUser);
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const clearUser = useCallback(() => {
    setUserState(null);
    setLoading(false);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        updatePoints,
        setUser,
        refreshUser,
        clearUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
