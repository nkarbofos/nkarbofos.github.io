import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useApi } from '../api/http';
import { linksService } from '../services/links';
import { useAuth } from '../state/AuthContext';
import { tagsService } from '../services/tags';
import { coursesService } from '../services/courses';
import type { Course, Tag } from '../services/types';

export default function UploadPage() {
  const { request } = useApi();
  const api = useMemo(() => linksService({ request }), [request]);
  const tagsApi = useMemo(() => tagsService({ request }), [request]);
  const coursesApi = useMemo(() => coursesService({ request }), [request]);
  const { userDb } = useAuth();

  const [linkName, setLinkName] = useState('');
  const [githubPagesUrl, setGithubPagesUrl] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [newTagName, setNewTagName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    void tagsApi
      .list()
      .then((rows) => {
        setAvailableTags(rows);
      })
      .catch((e) => {
        setAvailableTags([]);
        setError(`Tags load failed: ${String(e)}`);
      });
    void coursesApi
      .list()
      .then((rows) => {
        setAvailableCourses(rows);
      })
      .catch((e) => {
        setAvailableCourses([]);
        setError(`Courses load failed: ${String(e)}`);
      });
  }, [coursesApi, tagsApi]);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Create Project</Typography>
      <Typography color="text.secondary">
        Publish a new student project to the ITMO showcase feed.
      </Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {ok ? <Alert severity="success">{ok}</Alert> : null}

      <Paper sx={{ p: 2.5, bgcolor: '#f6f3f2', maxWidth: 900 }}>
        <Stack spacing={2}>
          <TextField
            label="Project title"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            fullWidth
          />
          <TextField
            label="GitHub Pages URL"
            value={githubPagesUrl}
            onChange={(e) => setGithubPagesUrl(e.target.value)}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Course (optional)</InputLabel>
            <Select
              label="Course (optional)"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(String(e.target.value))}
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
              value={selectedTagIds}
              onChange={(e) =>
                setSelectedTagIds(
                  typeof e.target.value === 'string'
                    ? e.target.value.split(',')
                    : (e.target.value as string[]),
                )
              }
              renderValue={(selected) => (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {(selected as string[])
                    .map((id) => availableTags.find((t) => t.id === id)?.name ?? id)
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              label="New tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              fullWidth
            />
            <Button
              variant="outlined"
              onClick={() => {
                void (async () => {
                  setError(null);
                  setOk(null);
                  try {
                    const name = newTagName.trim();
                    if (!name) throw new Error('Enter tag name');
                    const created = await tagsApi.create({ name });
                    setAvailableTags((prev) => [created, ...prev]);
                    setSelectedTagIds((prev) =>
                      prev.includes(created.id) ? prev : [...prev, created.id],
                    );
                    setNewTagName('');
                    setOk(`Tag created: ${created.name}`);
                  } catch (e) {
                    setError(String(e));
                  }
                })();
              }}
            >
              Add tag
            </Button>
          </Stack>

          <Button
            variant="contained"
            onClick={() => {
              void (async () => {
                setError(null);
                setOk(null);
                try {
                  if (!userDb?.id)
                    throw new Error(
                      'DB profile is missing. Open /profile or complete registration.',
                    );
                  const created = await api.create({
                    userId: userDb.id,
                    linkName,
                    githubPagesUrl,
                  });

                  for (const tagId of selectedTagIds) {
                    await api.addTag(created.id, tagId);
                  }
                  if (selectedCourseId) {
                    await api.addCourse(created.id, selectedCourseId);
                  }

                  setOk('Project created');
                  setLinkName('');
                  setGithubPagesUrl('');
                  setSelectedTagIds([]);
                  setSelectedCourseId('');
                } catch (e) {
                  setError(String(e));
                }
              })();
            }}
          >
            Publish project
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
