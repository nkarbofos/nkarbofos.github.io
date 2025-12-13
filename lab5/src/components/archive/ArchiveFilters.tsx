import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Autocomplete,
  TextField,
  Chip,
  Button,
  Stack,
} from '@mui/material';
import { Clear } from '@mui/icons-material';
import { getAllUsers } from '../../services/archive';
import { AVAILABLE_TAGS } from '../../types';

interface ArchiveFiltersProps {
  onFiltersChange: (filters: { tags?: string[]; userId?: string }) => void;
}

const ArchiveFilters: React.FC<ArchiveFiltersProps> = ({ onFiltersChange }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<
    Array<{ userId: string; firstName: string; lastName: string }>
  >([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await getAllUsers();
      setAvailableUsers(users);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    onFiltersChange({
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      userId: selectedUserId || undefined,
    });
  }, [selectedTags, selectedUserId, onFiltersChange]);

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSelectedUserId(null);
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedUserId !== null;

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, sm: 3, lg: 4 },
        mb: { xs: 2, sm: 3, lg: 4 },
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontSize: { xs: '1.25rem', sm: '1.5rem', lg: '1.75rem' },
        }}
      >
        Фильтры
      </Typography>

      <Stack spacing={{ xs: 1.5, sm: 2, lg: 2.5 }}>
        {/* Tags Filter */}
        <Autocomplete
          multiple
          options={AVAILABLE_TAGS}
          value={selectedTags}
          onChange={(_, newValue) => setSelectedTags(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Теги" placeholder="Выберите теги" />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                variant="outlined"
                label={option}
                {...getTagProps({ index })}
                key={option}
              />
            ))
          }
        />

        {/* User Filter */}
        <Autocomplete
          options={availableUsers}
          value={
            selectedUserId
              ? availableUsers.find((u) => u.userId === selectedUserId) || null
              : null
          }
          onChange={(_, newValue) => setSelectedUserId(newValue?.userId || null)}
          getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
          renderInput={(params) => (
            <TextField {...params} label="Пользователь" placeholder="Выберите пользователя" />
          )}
        />

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={handleClearFilters}
            fullWidth
          >
            Очистить фильтры
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

export default ArchiveFilters;

