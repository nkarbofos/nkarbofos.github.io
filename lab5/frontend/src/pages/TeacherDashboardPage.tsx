import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useApi } from '../api/http';
import { usersService } from '../services/users';
import { linksService } from '../services/links';

export default function TeacherDashboardPage() {
  const { request } = useApi();
  const usersApi = useMemo(() => usersService({ request }), [request]);
  const linksApi = useMemo(() => linksService({ request }), [request]);

  const [usersCount, setUsersCount] = useState<number>(0);
  const [linksCount, setLinksCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setError(null);
      try {
        const [users, links] = await Promise.all([
          usersApi.list({ page: 1, pageSize: 100 }),
          linksApi.list({ page: 1, pageSize: 100 }),
        ]);
        setUsersCount(users.length);
        setLinksCount(links.length);
      } catch (e) {
        setError(String(e));
      }
    })();
  }, [linksApi, usersApi]);

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Instructor Dashboard</Typography>
      <Typography color="text.secondary">
        Read-only analytics based on currently available API endpoints.
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Students
              </Typography>
              <Typography variant="h3">{usersCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Projects
              </Typography>
              <Typography variant="h3">{linksCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

