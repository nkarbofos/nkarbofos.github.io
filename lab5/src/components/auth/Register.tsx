import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link as RouterLink, Navigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (!authLoading && currentUser) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (!firstName.trim() || firstName.trim().length < 2) {
      setError('Введите имя (минимум 2 символа)');
      return;
    }

    if (!lastName.trim() || lastName.trim().length < 2) {
      setError('Введите фамилию (минимум 2 символа)');
      return;
    }

    if (!email.trim()) {
      setError('Введите email');
      return;
    }

    // Validate telegram URL if provided
    if (telegramUrl.trim() && !telegramUrl.match(/^https:\/\/t\.me\/[\w]+$/)) {
      setError('Неверный формат ссылки на Telegram. Используйте: https://t.me/username');
      return;
    }

    setLoading(true);

    try {
      await register(
        email.trim(),
        password,
        firstName.trim(),
        lastName.trim(),
        telegramUrl.trim() || undefined
      );
      navigate('/');
    } catch (err: any) {
      let errorMessage = 'Ошибка регистрации. Попробуйте еще раз.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Пользователь с таким email уже существует.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Неверный формат email.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Пароль слишком слабый. Используйте более сложный пароль.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        px: { xs: 2, sm: 3, lg: 4 },
      }}
    >
      <Box
        sx={{
          marginTop: { xs: 4, sm: 8, lg: 10 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: { xs: 3, sm: 4, lg: 5 },
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Регистрация
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="firstName"
              label="Имя"
              name="firstName"
              autoComplete="given-name"
              autoFocus
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
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
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Подтвердите пароль"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
            <Box textAlign="center">
              <Link component={RouterLink} to="/login" variant="body2">
                Уже есть аккаунт? Войти
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;

