import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';
import type { UserDb } from '../services/types';
import { API_BASE_URL } from '../api/http';

type AuthCtx = {
  user: FirebaseUser | null;
  userDb: UserDb | null;
  loading: boolean;
  getIdToken: () => Promise<string | null>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<string>;
  applyDbProfile: (profile: UserDb) => void;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userDb, setUserDb] = useState<UserDb | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    void (async () => {
      if (!user) {
        setUserDb(null);
        return;
      }
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null);
      if (!res || !res.ok) {
        setUserDb(null);
        return;
      }
      const json = (await res.json()) as UserDb;
      setUserDb(json);
    })();
  }, [user]);

  const value = useMemo<AuthCtx>(() => {
    return {
      user,
      userDb,
      loading,
      getIdToken: async () => (user ? await user.getIdToken() : null),
      login: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      register: async (email, password) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        setUser(cred.user);
        return await cred.user.getIdToken(true);
      },
      applyDbProfile: (profile) => {
        setUserDb(profile);
      },
      logout: async () => {
        await signOut(auth);
      },
    };
  }, [user, userDb, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('AuthContext missing');
  return ctx;
}
