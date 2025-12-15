import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Link,
  Chip,
} from '@mui/material';
import { Person, Email, Telegram } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById } from '../../services/user';
import type { User } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !userId) {
      navigate('/');
      return;
    }

    const fetchUser = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);
      try {
        const userData = await getUserById(userId);
        if (userData) {
          setUser(userData);
        } else {
          setError('Пользователь не найден');
        }
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке профиля');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate, authLoading]);

  if (authLoading || loading) {
    return (
      <Box
        sx={{
          width: '100%',
          mt: { xs: 2, sm: 4, lg: 6 },
          px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box
        sx={{
          width: '100%',
          mt: { xs: 2, sm: 4, lg: 6 },
          px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
        }}
      >
        <Alert severity="error">{error || 'Пользователь не найден'}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        mt: { xs: 2, sm: 4, lg: 6 },
        mb: { xs: 2, sm: 4, lg: 6 },
        px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4, lg: 5 },
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          mb={3}
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Person
            sx={{
              fontSize: { xs: 40, sm: 48 },
              color: 'primary.main',
              mr: { xs: 0, sm: 2 },
              mb: { xs: 2, sm: 0 },
            }}
          />
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.125rem', lg: '2.5rem' },
              }}
            >
              {user.firstName} {user.lastName}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              Профиль пользователя
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            <Email
              sx={{
                mr: { xs: 0, sm: 2 },
                mb: { xs: 1, sm: 0 },
                color: 'text.secondary',
                fontSize: { xs: 28, sm: 32 },
              }}
            />
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                Email
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  wordBreak: 'break-word',
                }}
              >
                {user.email}
              </Typography>
            </Box>
          </Box>

          {user.telegramUrl && (
            <Box
              display="flex"
              alignItems="center"
              sx={{
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' },
              }}
            >
              <Telegram
                sx={{
                  mr: { xs: 0, sm: 2 },
                  mb: { xs: 1, sm: 0 },
                  color: 'text.secondary',
                  fontSize: { xs: 28, sm: 32 },
                }}
              />
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                >
                  Telegram
                </Typography>
                <Link
                  href={user.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    wordBreak: 'break-word',
                  }}
                >
                  {user.telegramUrl}
                </Link>
              </Box>
            </Box>
          )}

          {!user.telegramUrl && (
            <Box
              display="flex"
              alignItems="center"
              sx={{
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' },
              }}
            >
              <Telegram
                sx={{
                  mr: { xs: 0, sm: 2 },
                  mb: { xs: 1, sm: 0 },
                  color: 'text.secondary',
                  fontSize: { xs: 28, sm: 32 },
                }}
              />
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                >
                  Telegram
                </Typography>
                <Chip
                  label="Не указан"
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default UserProfile;

