import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useApi } from '../api/http';
import { usersService } from '../services/users';
import { linksService } from '../services/links';
import type { LinkWithRelations, UserDb } from '../services/types';
import ArchiveCard from '../components/archive/ArchiveCard';

export default function UserProfilePage() {
  const { userId } = useParams();
  const { request } = useApi();
  const usersApi = useMemo(() => usersService({ request }), [request]);
  const linksApi = useMemo(() => linksService({ request }), [request]);

  const [user, setUser] = useState<UserDb | null>(null);
  const [items, setItems] = useState<LinkWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const [u, links] = await Promise.all([
          usersApi.get(userId),
          linksApi.list({ page: 1, pageSize: 50, userId }),
        ]);
        setUser(u);
        setItems(links);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [linksApi, userId, usersApi]);

  if (!userId) return <Alert severity="error">Missing userId</Alert>;

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
  return (
    <Stack spacing={2}>
      <Typography variant="h5">
        {fullName ? `Работы пользователя: ${fullName}` : `Работы пользователя`}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        userId: {userId}
      </Typography>
      {items.length ? (
        items.map((x) => <ArchiveCard key={x.id} item={x} />)
      ) : (
        <Alert severity="info">У пользователя пока нет работ</Alert>
      )}
    </Stack>
  );
}
