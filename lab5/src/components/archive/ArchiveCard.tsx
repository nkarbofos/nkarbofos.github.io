import React from 'react';
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
} from '@mui/material';
import { OpenInNew, Person } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import type { Archive } from '../../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';

interface ArchiveCardProps {
  archive: Archive;
}

const ArchiveCard: React.FC<ArchiveCardProps> = ({ archive }) => {
  const formattedDate = format(archive.uploadedAt.toDate(), 'dd MMMM yyyy', {
    locale: ru,
  });

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
              {archive.firstName} {archive.lastName}
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
          justifyContent: 'flex-end',
          px: { xs: 1.5, sm: 2 },
          pb: { xs: 1.5, sm: 2 },
        }}
      >
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
    </Card>
  );
};

export default ArchiveCard;

