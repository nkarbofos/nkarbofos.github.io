import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { OpenInNew, Person, Delete } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import type { Archive } from '../../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { useAuth } from '../../hooks/useAuth';
import { deleteArchive } from '../../services/archive';

interface ArchiveCardProps {
  archive: Archive;
  onDelete?: (archiveId: string) => void;
}

const ArchiveCard: React.FC<ArchiveCardProps> = ({ archive, onDelete }) => {
  const { currentUser } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const formattedDate = format(archive.uploadedAt.toDate(), 'dd MMMM yyyy', {
    locale: ru,
  });

  const isOwner = currentUser?.uid === archive.userId;

  // Безопасное отображение имени пользователя
  const displayName = 
    archive.firstName && archive.lastName
      ? `${archive.firstName} ${archive.lastName}`
      : archive.firstName || archive.lastName || 'Неизвестный пользователь';

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteArchive(archive.id);
      setSnackbar({ open: true, message: 'Ссылка успешно удалена', severity: 'success' });
      setDeleteDialogOpen(false);
      if (onDelete) {
        onDelete(archive.id);
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Ошибка при удалении ссылки',
        severity: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              mr: 1,
              width: { xs: 28, sm: 32 },
              height: { xs: 28, sm: 32 },
            }}
          >
            <Person fontSize="small" />
          </Avatar>
          <Link
            component={RouterLink}
            to={`/user/${archive.userId}`}
            sx={{ textDecoration: 'none', color: 'text.secondary' }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                '&:hover': { color: 'primary.main' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              {displayName}
            </Typography>
          </Link>
        </Box>

        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem', lg: '1.375rem' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {archive.linkName}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          Добавлено: {formattedDate}
        </Typography>

        <Box sx={{ mt: 2, mb: 2 }}>
          {archive.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                mr: 0.5,
                mb: 0.5,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                height: { xs: 20, sm: 24 },
              }}
              variant="outlined"
            />
          ))}
        </Box>
      </CardContent>

      <CardActions
        sx={{
          justifyContent: 'space-between',
          px: { xs: 1.5, sm: 2 },
          pb: { xs: 1.5, sm: 2 },
        }}
      >
        {isOwner && (
          <IconButton
            color="error"
            size="small"
            onClick={handleDeleteClick}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
            aria-label="удалить ссылку"
          >
            <Delete fontSize="small" />
          </IconButton>
        )}
        <Box sx={{ flexGrow: isOwner ? 0 : 1 }} />
        <Button
          variant="contained"
          size="small"
          startIcon={<OpenInNew />}
          href={archive.githubPagesUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          }}
        >
          Открыть сайт
        </Button>
      </CardActions>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Вы уверены, что хотите удалить ссылку &quot;{archive.linkName}&quot;? Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Отмена
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default ArchiveCard;

