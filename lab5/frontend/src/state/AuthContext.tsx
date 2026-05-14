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
      // #region agent log
      fetch('http://127.0.0.1:7698/ingest/4b986e75-e98f-4cb5-907e-12224c08cdcd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': '191d33',
        },
        body: JSON.stringify({
          sessionId: '191d33',
          runId: 'pre-fix',
          hypothesisId: 'H2-H3-H5',
          location: 'frontend/src/state/AuthContext.tsx:before-auth-me',
          message: 'AuthContext is about to request DB profile',
          data: { hasFirebaseUser: Boolean(user), hasToken: Boolean(token) },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null);
      // #region agent log
      fetch('http://127.0.0.1:7698/ingest/4b986e75-e98f-4cb5-907e-12224c08cdcd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': '191d33',
        },
        body: JSON.stringify({
          sessionId: '191d33',
          runId: 'pre-fix',
          hypothesisId: 'H3-H5',
          location: 'frontend/src/state/AuthContext.tsx:after-auth-me',
          message: 'AuthContext received DB profile response',
          data: { hasResponse: Boolean(res), status: res?.status ?? null, ok: res?.ok ?? false },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (!res || !res.ok) {
        setUserDb(null);
        return;
      }
      const json = (await res.json()) as UserDb;
      setUserDb(json);
      // #region agent log
      fetch('http://127.0.0.1:7698/ingest/4b986e75-e98f-4cb5-907e-12224c08cdcd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': '191d33',
        },
        body: JSON.stringify({
          sessionId: '191d33',
          runId: 'pre-fix',
          hypothesisId: 'H3-H5',
          location: 'frontend/src/state/AuthContext.tsx:after-set-user-db',
          message: 'AuthContext stored DB profile',
          data: { hasDbProfileId: Boolean(json.id), role: json.role },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
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
        // #region agent log
        fetch('http://127.0.0.1:7698/ingest/4b986e75-e98f-4cb5-907e-12224c08cdcd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '191d33',
          },
          body: JSON.stringify({
            sessionId: '191d33',
            runId: 'post-fix',
            hypothesisId: 'H3',
            location: 'frontend/src/state/AuthContext.tsx:apply-db-profile',
            message: 'AuthContext stored DB profile returned by registration',
            data: { hasDbProfileId: Boolean(profile.id), role: profile.role },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
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
