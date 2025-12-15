import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Paper } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { getArchives } from '../../services/archive';
import type { Archive } from '../../types';
import ArchiveCard from '../archive/ArchiveCard';
import { useNavigate } from 'react-router-dom';

const MyLinks: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
      return;
    }

    if (currentUser) {
      fetchMyArchives();
    }
  }, [currentUser, authLoading, navigate]);

  const fetchMyArchives = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getArchives({ userId: currentUser.uid });
      setArchives(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке проектов');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (archiveId: string) => {
    setArchives((prev) => prev.filter((archive) => archive.id !== archiveId));
    fetchMyArchives();
  };

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

  if (error) {
    return (
      <Box
        sx={{
          width: '100%',
          mt: { xs: 2, sm: 4, lg: 6 },
          px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
        }}
      >
        <Alert severity="error">{error}</Alert>
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
        elevation={2}
        sx={{
          p: { xs: 3, sm: 4, lg: 5 },
          mb: { xs: 3, sm: 4, lg: 6 },
          backgroundColor: 'background.paper',
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontSize: { xs: '1.75rem', sm: '2.125rem', lg: '2.5rem' },
            mb: 2,
          }}
        >
          Мои проекты
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
            mb: 4,
          }}
        >
          Здесь вы можете управлять своими проектами
        </Typography>
      </Paper>

      {archives.length === 0 ? (
        <Paper
          elevation={2}
          sx={{
            p: { xs: 4, sm: 6, lg: 8 },
            textAlign: 'center',
            backgroundColor: 'background.paper',
          }}
        >
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom
            sx={{
              fontSize: { xs: '1.125rem', sm: '1.25rem', lg: '1.5rem' },
            }}
          >
            У вас пока нет проектов
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
              mt: 2,
            }}
          >
            Добавьте свой первый проект
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(4, 1fr)',
            },
            gap: { xs: 2, sm: 3, lg: 4 },
          }}
        >
          {archives.map((archive) => (
            <Box key={archive.id}>
              <ArchiveCard archive={archive} onDelete={handleDelete} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MyLinks;

