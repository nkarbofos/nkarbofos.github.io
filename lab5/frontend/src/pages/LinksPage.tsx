import React, { useEffect, useState } from 'react';
import {
  Alert,
  Card,
  CardContent,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useApi } from '../api/http';

type LinkItem = {
  id: string;
  linkName: string;
  githubPagesUrl: string;
  createdAt: string;
};

export default function LinksPage() {
  const { request } = useApi();
  const [items, setItems] = useState<LinkItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setError(null);
        const data = await request<LinkItem[]>(`/api/links?page=1&pageSize=20`);
        setItems(data);
      } catch (e) {
        setError(String(e));
      }
    })();
  }, [request]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Links</Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {items.map((x) => (
        <Card key={x.id} variant="outlined">
          <CardContent>
            <Typography variant="h6">{x.linkName}</Typography>
            <Link href={x.githubPagesUrl} target="_blank" rel="noreferrer">
              {x.githubPagesUrl}
            </Link>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
