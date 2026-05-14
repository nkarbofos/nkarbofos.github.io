import React from 'react';
import { Card, CardContent, Chip, Link, Stack, Typography } from '@mui/material';
import type { LinkWithRelations } from '../../services/types';
import { Link as RouterLink } from 'react-router-dom';

export default function ArchiveCard({ item }: { item: LinkWithRelations }) {
  const authorName = `${item.user.firstName} ${item.user.lastName}`.trim();
  const tags = item.tags?.map((t) => t.tag) ?? [];
  const courses = item.courses?.map((c) => c.course) ?? [];
  return (
    <Card sx={{ bgcolor: 'background.paper' }}>
      <CardContent>
        <Stack spacing={1.25}>
          <Typography
            variant="h6"
            component={RouterLink}
            to={`/project/${item.id}`}
            sx={{ textDecoration: 'none', color: 'text.primary' }}
          >
            {item.linkName}
          </Typography>
          <Link href={item.githubPagesUrl} target="_blank" rel="noreferrer">
            {item.githubPagesUrl}
          </Link>
          <Typography variant="body2" color="text.secondary">
            Автор:{' '}
            <Link
              component={RouterLink}
              to={`/user/${item.user.id}`}
              underline="hover"
            >
              {authorName || item.user.id}
            </Link>
          </Typography>
          {courses.length || tags.length ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {courses.map((c) => (
                <Chip key={c.id} size="small" label={`Course: ${c.name}`} />
              ))}
              {tags.map((t) => (
                <Chip key={t.id} size="small" label={t.name} />
              ))}
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
