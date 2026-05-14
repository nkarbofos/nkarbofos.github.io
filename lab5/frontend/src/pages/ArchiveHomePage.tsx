import React, { useCallback, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import ArchiveFilters, {
  type ArchiveFiltersValue,
} from '../components/archive/ArchiveFilters';
import ArchiveList from '../components/archive/ArchiveList';

export default function ArchiveHomePage() {
  const [filters, setFilters] = useState<ArchiveFiltersValue>({});
  const onChange = useCallback((v: ArchiveFiltersValue) => setFilters(v), []);

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <Box className="glass-panel" sx={{ borderRadius: 2, p: 2 }}>
        <Typography variant="overline" color="text.secondary">
          ITMO Digital Atheneum
        </Typography>
        <Typography variant="h4">Project Feed</Typography>
        <Typography color="text.secondary">
          Discover, filter and review student projects.
        </Typography>
      </Box>
      <ArchiveFilters value={filters} onChange={onChange} />
      <ArchiveList filters={filters} />
    </Stack>
  );
}
