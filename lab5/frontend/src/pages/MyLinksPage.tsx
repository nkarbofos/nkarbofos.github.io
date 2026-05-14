import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useApi } from '../api/http';
import { linksService } from '../services/links';
import { useAuth } from '../state/AuthContext';
import ArchiveCard from '../components/archive/ArchiveCard';
import type { Course, LinkWithRelations, Tag } from '../services/types';
import { tagsService } from '../services/tags';
import { coursesService } from '../services/courses';

export default function MyLinksPage() {
  const { userDb } = useAuth();
  const { request } = useApi();
  const api = useMemo(() => linksService({ request }), [request]);
  const tagsApi = useMemo(() => tagsService({ request }), [request]);
  const coursesApi = useMemo(() => coursesService({ request }), [request]);

  const [items, setItems] = useState<LinkWithRelations[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

  const [editing, setEditing] = useState<LinkWithRelations | null>(null);
  const [editLinkName, setEditLinkName] = useState('');
  const [editGithubPagesUrl, setEditGithubPagesUrl] = useState('');
  const [editTagIds, setEditTagIds] = useState<string[]>([]);
  const [editCourseId, setEditCourseId] = useState<string>('');

  useEffect(() => {
    void (async () => {
      try {
        if (!userDb?.id) throw new Error('DB profile missing');
        const data = await api.list({
          page: 1,
          pageSize: 50,
          userId: userDb.id,
        });
        setItems(data);
      } catch (e) {
        setError(String(e));
      }
    })();
  }, [api, userDb?.id]);

  useEffect(() => {
    void tagsApi
      .list()
      .then(setAvailableTags)
      .catch(() => setAvailableTags([]));
    void coursesApi
      .list()
      .then(setAvailableCourses)
      .catch(() => setAvailableCourses([]));
  }, [coursesApi, tagsApi]);

  const openEdit = (item: LinkWithRelations) => {
    setOk(null);
    setError(null);
    setEditing(item);
    setEditLinkName(item.linkName);
    setEditGithubPagesUrl(item.githubPagesUrl);
    setEditTagIds(item.tags.map((t) => t.tag.id));
    setEditCourseId(item.courses[0]?.course.id ?? '');
  };

  const closeEdit = () => {
    setEditing(null);
  };

  const refresh = async () => {
    if (!userDb?.id) return;
    const data = await api.list({ page: 1, pageSize: 50, userId: userDb.id });
    setItems(data);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Мои проекты</Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {ok ? <Alert severity="success">{ok}</Alert> : null}
      {items.map((x) => (
        <Box key={x.id}>
          <ArchiveCard item={x} />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button variant="outlined" onClick={() => openEdit(x)}>
              Редактировать
            </Button>
          </Stack>
        </Box>
      ))}

      <Dialog open={Boolean(editing)} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать проект</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Название"
              value={editLinkName}
              onChange={(e) => setEditLinkName(e.target.value)}
              fullWidth
            />
            <TextField
              label="GitHub Pages URL"
              value={editGithubPagesUrl}
              onChange={(e) => setEditGithubPagesUrl(e.target.value)}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Course (optional)</InputLabel>
              <Select
                label="Course (optional)"
                value={editCourseId}
                onChange={(e) => setEditCourseId(String(e.target.value))}
              >
                <MenuItem value="">None</MenuItem>
                {availableCourses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Tags</InputLabel>
              <Select
                label="Tags"
                multiple
                value={editTagIds}
                onChange={(e) =>
                  setEditTagIds(
                    typeof e.target.value === 'string'
                      ? e.target.value.split(',')
                      : (e.target.value as string[]),
                  )
                }
                renderValue={(selected) => (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {(selected as string[])
                      .map(
                        (id) =>
                          availableTags.find((t) => t.id === id)?.name ?? id,
                      )
                      .map((name) => (
                        <Chip key={name} size="small" label={name} />
                      ))}
                  </Stack>
                )}
              >
                {availableTags.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Отмена</Button>
          <Button
            variant="contained"
            onClick={() => {
              void (async () => {
                if (!editing) return;
                setError(null);
                setOk(null);
                try {
                  await api.update(editing.id, {
                    linkName: editLinkName,
                    githubPagesUrl: editGithubPagesUrl,
                  });

                  const prevTagIds = new Set(editing.tags.map((t) => t.tag.id));
                  const nextTagIds = new Set(editTagIds);
                  for (const tagId of nextTagIds) {
                    if (!prevTagIds.has(tagId)) {
                      await api.addTag(editing.id, tagId);
                    }
                  }
                  for (const tagId of prevTagIds) {
                    if (!nextTagIds.has(tagId)) {
                      await api.removeTag(editing.id, tagId);
                    }
                  }

                  const prevCourseId = editing.courses[0]?.course.id ?? '';
                  const nextCourseId = editCourseId;
                  if (prevCourseId && prevCourseId !== nextCourseId) {
                    await api.removeCourse(editing.id, prevCourseId);
                  }
                  if (nextCourseId && prevCourseId !== nextCourseId) {
                    await api.addCourse(editing.id, nextCourseId);
                  }

                  await refresh();
                  setOk('Сохранено');
                  closeEdit();
                } catch (e) {
                  setError(String(e));
                }
              })();
            }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
