import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useApi } from '../../api/http';
import { tagsService } from '../../services/tags';
import { coursesService } from '../../services/courses';
import { usersService } from '../../services/users';
import type { Course, Tag, UserDb } from '../../services/types';

export type ArchiveFiltersValue = {
  userId?: string;
  tagId?: string;
  courseId?: string;
  authorName?: string;
};

export default function ArchiveFilters(props: {
  value: ArchiveFiltersValue;
  onChange: (v: ArchiveFiltersValue) => void;
}) {
  const { request } = useApi();
  const tagsApi = useMemo(() => tagsService({ request }), [request]);
  const coursesApi = useMemo(() => coursesService({ request }), [request]);
  const usersApi = useMemo(() => usersService({ request }), [request]);

  const [tags, setTags] = useState<Tag[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<UserDb[]>([]);
  const [tagQuery, setTagQuery] = useState('');
  const [courseQuery, setCourseQuery] = useState('');
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  useEffect(() => {
    void tagsApi
      .list()
      .then((rows) => {
        setTags(rows);
        setTagsError(null);
      })
      .catch((e) => {
        setTags([]);
        setTagsError(String(e));
      });
    void coursesApi
      .list()
      .then((rows) => {
        setCourses(rows);
        setCoursesError(null);
      })
      .catch((e) => {
        setCourses([]);
        setCoursesError(String(e));
      });
    void usersApi
      .list({ page: 1, pageSize: 100 })
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [coursesApi, tagsApi, usersApi]);

  const authorName = (props.value.authorName ?? '').trim();
  const authorMatches = authorName
    ? users.filter((u) =>
        `${u.firstName} ${u.lastName}`
          .toLowerCase()
          .includes(authorName.toLowerCase()),
      )
    : [];

  const matchedTag = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    if (!q) return null;
    const matches = tags
      .filter((t) => t.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
    return matches[0] ?? null;
  }, [tagQuery, tags]);

  const matchedCourse = useMemo(() => {
    const q = courseQuery.trim().toLowerCase();
    if (!q) return null;
    const matches = courses
      .filter((c) => c.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
    return matches[0] ?? null;
  }, [courseQuery, courses]);

  useEffect(() => {
    // Auto-apply first matching tag.
    if (!tagQuery.trim()) {
      if (props.value.tagId)
        props.onChange({ ...props.value, tagId: undefined });
      return;
    }
    const nextId = matchedTag?.id;
    if (nextId && props.value.tagId !== nextId) {
      props.onChange({ ...props.value, tagId: nextId });
    }
  }, [matchedTag?.id, props.value, props.onChange, tagQuery]);

  useEffect(() => {
    // Auto-apply first matching course.
    if (!courseQuery.trim()) {
      if (props.value.courseId)
        props.onChange({ ...props.value, courseId: undefined });
      return;
    }
    const nextId = matchedCourse?.id;
    if (nextId && props.value.courseId !== nextId) {
      props.onChange({ ...props.value, courseId: nextId });
    }
  }, [courseQuery, matchedCourse?.id, props.value, props.onChange]);

  return (
    <Paper sx={{ width: '100%', p: 2, bgcolor: '#f6f3f2' }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Filter projects
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Stack spacing={1} sx={{ flex: 1, minWidth: 220 }}>
          <TextField
            label="Author name"
            value={props.value.authorName ?? ''}
            onChange={(e) => {
              const nextName = e.target.value;
              props.onChange({
                ...props.value,
                authorName: nextName,
                userId: undefined,
              });
            }}
            fullWidth
          />
          {authorName && authorMatches.length > 1 ? (
            <FormControl fullWidth>
              <InputLabel>Choose author</InputLabel>
              <Select
                label="Choose author"
                value={props.value.userId ?? ''}
                onChange={(e) =>
                  props.onChange({
                    ...props.value,
                    userId: String(e.target.value) || undefined,
                  })
                }
              >
                <MenuItem value="">Any</MenuItem>
                {authorMatches.slice(0, 20).map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
        </Stack>

        <Stack spacing={1} sx={{ flex: 1, minWidth: 220 }}>
          <TextField
            label="Tag"
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            helperText={
              tagQuery.trim()
                ? matchedTag
                  ? `Matched: ${matchedTag.name}`
                  : 'No matches'
                : ''
            }
            fullWidth
          />
          {tagsError ? (
            <Typography variant="caption" color="error">
              {tagsError}
            </Typography>
          ) : null}
        </Stack>

        <Stack spacing={1} sx={{ flex: 1, minWidth: 220 }}>
          <TextField
            label="Course"
            value={courseQuery}
            onChange={(e) => setCourseQuery(e.target.value)}
            helperText={
              courseQuery.trim()
                ? matchedCourse
                  ? `Matched: ${matchedCourse.name}`
                  : 'No matches'
                : ''
            }
            fullWidth
          />
          {coursesError ? (
            <Typography variant="caption" color="error">
              {coursesError}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
}
