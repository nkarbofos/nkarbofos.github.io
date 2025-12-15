import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
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

  const fetchArchives = useCallback(async () => {
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
  }, [filters]);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  const handleDelete = (archiveId: string) => {
    setArchives((prev) => prev.filter((archive) => archive.id !== archiveId));
    fetchArchives();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          width: '100%',
          mt: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (archives.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          mt: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
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
      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
            xl: 'repeat(5, 1fr)',
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
    </Box>
  );
};

export default ArchiveList;

