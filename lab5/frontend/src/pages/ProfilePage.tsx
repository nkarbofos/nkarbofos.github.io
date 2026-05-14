import React, { useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useApi } from '../api/http';
import { useAuth } from '../state/AuthContext';

export default function ProfilePage() {
  const { userDb } = useAuth();
  const { request } = useApi();

  const [firstName, setFirstName] = useState(userDb?.firstName ?? '');
  const [lastName, setLastName] = useState(userDb?.lastName ?? '');
  const [telegramUrl, setTelegramUrl] = useState(userDb?.telegramUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  return (
    <Stack spacing={2} maxWidth={760}>
      <Typography variant="h4">Student Profile</Typography>
      <Typography color="text.secondary">
        Manage your public academic profile and contact data.
      </Typography>
      {!userDb ? (
        <Alert severity="warning">
          DB profile was not found. Please complete registration.
        </Alert>
      ) : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {ok ? <Alert severity="success">{ok}</Alert> : null}

      <Paper sx={{ p: 2.5, bgcolor: '#f6f3f2' }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={userDb?.avatarUrl ?? undefined}
              sx={{ width: 72, height: 72 }}
            >
              {(userDb?.firstName?.[0] ?? userDb?.email?.[0] ?? 'U').toUpperCase()}
            </Avatar>
            <Stack spacing={0.5}>
              <Typography variant="h6">
                {`${userDb?.firstName ?? ''} ${userDb?.lastName ?? ''}`.trim() ||
                  'Student'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userDb?.role ?? 'USER'}
              </Typography>
            </Stack>
          </Stack>

          <TextField label="Email" value={userDb?.email ?? ''} disabled />
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
                setOk(null);
                try {
                  if (!userDb?.id) throw new Error('Missing DB user id');
                  await request(`/api/users/${userDb.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      firstName,
                      lastName,
                      telegramUrl: telegramUrl.trim() ? telegramUrl.trim() : null,
                    }),
                  });
                  setOk('Saved');
                } catch (e) {
                  setError(String(e));
                }
              })();
            }}
          >
            Save profile
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
