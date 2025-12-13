import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/user';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { currentUser, userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
      return;
    }

    if (userData) {
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setEmail(userData.email || '');
      setTelegramUrl(userData.telegramUrl || '');
    }
  }, [userData, currentUser, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!firstName.trim() || firstName.trim().length < 2) {
      setError('Имя должно содержать минимум 2 символа');
      return;
    }

    if (!lastName.trim() || lastName.trim().length < 2) {
      setError('Фамилия должна содержать минимум 2 символа');
      return;
    }

    if (!email.trim()) {
      setError('Email обязателен');
      return;
    }

    // Validate telegram URL if provided
    if (telegramUrl.trim() && !telegramUrl.match(/^https:\/\/t\.me\/[\w]+$/)) {
      setError('Неверный формат ссылки на Telegram. Используйте: https://t.me/username');
      return;
    }

    if (!currentUser) {
      setError('Вы должны быть авторизованы');
      return;
    }

    setLoading(true);

    try {
      await updateUserProfile(currentUser.uid, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        telegramUrl: telegramUrl.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении профиля');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        mt: { xs: 2, sm: 4, lg: 6 },
        mb: { xs: 2, sm: 4, lg: 6 },
        px: { xs: 2, sm: 3, lg: 4, xl: 6 },
        maxWidth: { xs: '100%', sm: '600px', lg: '800px', xl: '900px' },
        mx: 'auto',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4, lg: 5 },
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontSize: { xs: '1.5rem', sm: '1.75rem', lg: '2rem' },
          }}
        >
          Редактирование профиля
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            Профиль успешно обновлен!
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="firstName"
            label="Имя"
            name="firstName"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="lastName"
            label="Фамилия"
            name="lastName"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="normal"
            fullWidth
            id="telegramUrl"
            label="Ссылка на Telegram (опционально)"
            name="telegramUrl"
            placeholder="https://t.me/username"
            value={telegramUrl}
            onChange={(e) => setTelegramUrl(e.target.value)}
            helperText="Формат: https://t.me/username"
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          >
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;

