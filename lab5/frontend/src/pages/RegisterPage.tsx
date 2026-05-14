import React, { useState } from 'react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useApi } from '../api/http';
import { authService } from '../services/auth';

export default function RegisterPage() {
  const { register, applyDbProfile, logout } = useAuth();
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
            let firebaseUserCreated = false;
            try {
              const idToken = await register(email, password);
              firebaseUserCreated = true;
              const dbProfile = await authApi.registerProfile({
                email,
                firstName,
                lastName,
                telegramUrl: normalizedTelegramUrl,
              }, { idToken });
              applyDbProfile(dbProfile);
              void nav('/');
            } catch (e) {
              if (firebaseUserCreated) {
                await logout().catch(() => {});
              }
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
