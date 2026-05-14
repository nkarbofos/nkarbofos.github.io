import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, CircularProgress, Link, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useApi } from '../api/http';
import { linksService } from '../services/links';
import type { LinkWithRelations } from '../services/types';

export default function ProjectPage() {
  const { linkId } = useParams();
  const { request } = useApi();
  const linksApi = useMemo(() => linksService({ request }), [request]);
  const [item, setItem] = useState<LinkWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (!linkId) return;
      setLoading(true);
      setError(null);
      try {
        const rows = await linksApi.list({ page: 1, pageSize: 100 });
        const found = rows.find((x) => x.id === linkId) ?? null;
        setItem(found);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [linkId, linksApi]);

  if (!linkId) return <Alert severity="error">Missing linkId</Alert>;
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!item) return <Alert severity="warning">Project not found</Alert>;

  const author = `${item.user.firstName} ${item.user.lastName}`.trim();

  return (
    <Stack spacing={3}>
      <Typography variant="overline" color="text.secondary">
        Projects / Details
      </Typography>
      <Typography variant="h4">{item.linkName}</Typography>
      <Typography color="text.secondary">
        Author: {author || item.user.email}
      </Typography>
      <Box>
        <Link href={item.githubPagesUrl} target="_blank" rel="noreferrer">
          {item.githubPagesUrl}
        </Link>
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {item.tags.map((t) => (
          <Chip key={t.tag.id} label={t.tag.name} />
        ))}
        {item.courses.map((c) => (
          <Chip key={c.course.id} label={`Course: ${c.course.name}`} />
        ))}
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Created at: {new Date(item.createdAt).toLocaleString()}
      </Typography>
    </Stack>
  );
}

