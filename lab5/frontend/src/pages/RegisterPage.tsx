import React, { useState } from 'react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useApi } from '../api/http';
import { authService } from '../services/auth';

export default function RegisterPage() {
  const { register, applyDbProfile } = useAuth();
  const { request } = useApi();
  const authApi = authService({ request });
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const normalizedTelegramUrl = (() => {
    const raw = telegramUrl.trim();
    if (!raw) return undefined;
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    if (raw.startsWith('@')) return `https://t.me/${raw.slice(1)}`;
    return `https://${raw}`;
  })();

  return (
    <Stack spacing={2} maxWidth={420}>
      <Typography variant="h5">Register</Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField
        label="First name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <TextField
        label="Last name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <TextField
        label="Telegram URL (optional)"
        value={telegramUrl}
        onChange={(e) => setTelegramUrl(e.target.value)}
      />
      <Button
        variant="contained"
        onClick={() => {
          void (async () => {
            setError(null);
            try {
              const idToken = await register(email, password);
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
                  hypothesisId: 'H1-H2-H3',
                  location: 'frontend/src/pages/RegisterPage.tsx:after-firebase-register',
                  message: 'Firebase register returned token before DB profile POST',
                  data: {
                    hasIdToken: Boolean(idToken),
                    tokenLength: idToken.length,
                    firstNameLength: firstName.length,
                    lastNameLength: lastName.length,
                    hasTelegramUrl: Boolean(normalizedTelegramUrl),
                  },
                  timestamp: Date.now(),
                }),
              }).catch(() => {});
              // #endregion
              const dbProfile = await authApi.registerProfile({
                email,
                firstName,
                lastName,
                telegramUrl: normalizedTelegramUrl,
              }, { idToken });
              applyDbProfile(dbProfile);
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
                  hypothesisId: 'H1-H4',
                  location: 'frontend/src/pages/RegisterPage.tsx:after-register-profile',
                  message: 'DB profile registration completed on frontend',
                  data: {
                    hasDbProfileId: Boolean(dbProfile.id),
                    role: dbProfile.role,
                  },
                  timestamp: Date.now(),
                }),
              }).catch(() => {});
              // #endregion
              void nav('/');
            } catch (e) {
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
                  hypothesisId: 'H1-H4',
                  location: 'frontend/src/pages/RegisterPage.tsx:register-catch',
                  message: 'Registration flow failed on frontend',
                  data: { error: e instanceof Error ? e.message : String(e) },
                  timestamp: Date.now(),
                }),
              }).catch(() => {});
              // #endregion
              setError(String(e));
            }
          })();
        }}
      >
        Create account
      </Button>
    </Stack>
  );
}
