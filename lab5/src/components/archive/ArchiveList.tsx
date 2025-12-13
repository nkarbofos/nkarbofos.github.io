import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { getArchives } from '../../services/archive';
import type { Archive } from '../../types';
import ArchiveCard from './ArchiveCard';

interface ArchiveListProps {
  filters?: {
    tags?: string[];
    userId?: string;
  };
}

const ArchiveList: React.FC<ArchiveListProps> = ({ filters }) => {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArchives = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getArchives(filters);
        setArchives(data);
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке архивов');
      } finally {
        setLoading(false);
      }
    };

    fetchArchives();
  }, [filters]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (archives.length === 0) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box textAlign="center" py={{ xs: 4, sm: 8 }}>
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom
            sx={{
              fontSize: { xs: '1.125rem', sm: '1.25rem', lg: '1.5rem' },
            }}
          >
            Архивы не найдены
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            {filters && (filters.tags || filters.userId)
              ? 'Попробуйте изменить параметры фильтрации'
              : 'Будьте первым, кто загрузит архив проекта!'}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        mt: { xs: 2, sm: 4, lg: 6 },
        mb: { xs: 2, sm: 4, lg: 6 },
        px: { xs: 2, sm: 3, lg: 4, xl: 6 },
        maxWidth: { xs: '100%', lg: '1400px', xl: '1600px' },
        mx: 'auto',
      }}
    >
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
          maxWidth: { xl: '1600px' },
          mx: { xl: 'auto' },
        }}
      >
        {archives.map((archive) => (
          <Box key={archive.id}>
            <ArchiveCard archive={archive} />
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default ArchiveList;

