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

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (!authLoading && currentUser) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Валидация перед отправкой
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError('Введите email');
      setLoading(false);
      return;
    }

    if (!trimmedPassword) {
      setError('Введите пароль');
      setLoading(false);
      return;
    }

    // Базовая валидация формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Неверный формат email');
      setLoading(false);
      return;
    }

    try {
      await login(trimmedEmail, trimmedPassword);
      navigate('/');
    } catch (err: any) {
      let errorMessage = 'Ошибка входа. Проверьте правильность данных.';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Пользователь с таким email не найден.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-password') {
        errorMessage = 'Неверный пароль.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Неверный формат email.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Слишком много попыток входа. Попробуйте позже.';
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Неверный email или пароль.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      console.error('Login error:', err); // Для отладки
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
            Вход
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
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
            <Box textAlign="center">
              <Link component={RouterLink} to="/register" variant="body2">
                Нет аккаунта? Зарегистрироваться
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;

