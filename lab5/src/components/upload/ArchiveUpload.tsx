import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Autocomplete,
} from '@mui/material';
import { AddLink } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { createArchive } from '../../services/archive';
import { AVAILABLE_TAGS } from '../../types';

const ArchiveUpload: React.FC = () => {
  const [linkName, setLinkName] = useState('');
  const [githubPagesUrl, setGithubPagesUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser, userData } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!linkName.trim() || linkName.trim().length < 3) {
      setError('Введите название ссылки (минимум 3 символа)');
      return;
    }

    if (!githubPagesUrl.trim()) {
      setError('Введите ссылку на GitHub Pages');
      return;
    }

    // Basic URL validation
    try {
      new URL(githubPagesUrl);
    } catch {
      setError('Введите корректную ссылку на GitHub Pages');
      return;
    }

    if (tags.length === 0) {
      setError('Выберите хотя бы один тег');
      return;
    }

    if (!currentUser || !userData) {
      setError('Вы должны быть авторизованы');
      return;
    }

    setLoading(true);

    try {
      // Save link to Firestore
      await createArchive({
        linkName: linkName.trim(),
        githubPagesUrl: githubPagesUrl.trim(),
        userId: currentUser.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        tags,
      });

      setSuccess(true);
      setLinkName('');
      setGithubPagesUrl('');
      setTags([]);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении ссылки');
    } finally {
      setLoading(false);
    }
  };

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
          Добавить ссылку на проект
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            Ссылка успешно добавлена!
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* Link Name */}
          <TextField
            fullWidth
            required
            label="Название ссылки"
            variant="outlined"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            placeholder="Например: Мой портфолио"
            helperText="Краткое описание того, на что ведет ссылка"
            autoComplete="off"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#ffffff',
                '&:hover': {
                  backgroundColor: '#ffffff',
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                },
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
              },
              '& input': {
                backgroundColor: '#ffffff',
              },
            }}
          />

          {/* GitHub Pages URL */}
          <TextField
            fullWidth
            required
            label="Ссылка на GitHub Pages"
            variant="outlined"
            type="url"
            value={githubPagesUrl}
            onChange={(e) => setGithubPagesUrl(e.target.value)}
            placeholder="https://username.github.io/repository"
            autoComplete="off"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#ffffff',
                '&:hover': {
                  backgroundColor: '#ffffff',
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                },
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
              },
              '& input': {
                backgroundColor: '#ffffff',
              },
            }}
          />

          {/* Tags */}
          <Autocomplete
            multiple
            options={AVAILABLE_TAGS}
            value={tags}
            onChange={(_, newValue) => setTags(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Теги"
                placeholder="Выберите теги (минимум 1)"
                helperText="Выберите хотя бы один тег"
                autoComplete="off"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#ffffff',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                    },
                  },
                  '& input': {
                    backgroundColor: '#ffffff',
                  },
                }}
              />
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
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddLink />}
          >
            {loading ? 'Сохранение...' : 'Добавить ссылку'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ArchiveUpload;
