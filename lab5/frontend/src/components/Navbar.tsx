import React from 'react';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Archive, Search } from '@mui/icons-material';
import { useAuth } from '../state/AuthContext';

export default function Navbar() {
  const { user, userDb, logout } = useAuth();
  const nav = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <Paper
      square
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ maxWidth: 1400, mx: 'auto', px: 3, py: 1.5, gap: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Archive fontSize="small" color="primary" />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 800 }}
          >
            ITMO Digital Atheneum
          </Typography>
          <Button component={RouterLink} to="/" color="inherit">
            Feed
          </Button>
          {user ? (
            <Button component={RouterLink} to="/my-links" color="inherit">
              My Projects
            </Button>
          ) : null}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Paper
            sx={{
              px: 1.5,
              py: 0.25,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              bgcolor: '#f0edec',
            }}
          >
            <Search sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />
            <InputBase placeholder="Search projects..." />
          </Paper>
          {userDb?.role === 'ADMIN' ? (
            <Button component={RouterLink} to="/teacher" color="inherit">
              Instructor Dashboard
            </Button>
          ) : null}
          {user ? (
            <Button variant="contained" component={RouterLink} to="/upload">
              Create Project
            </Button>
          ) : (
            <>
              <Button component={RouterLink} to="/login">
                Login
              </Button>
              <Button variant="contained" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          )}
          {user ? (
            <>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar
                  sx={{
                    bgcolor: 'secondary.main',
                    width: 34,
                    height: 34,
                    fontSize: 14,
                  }}
                >
                  {(userDb?.firstName?.[0] ?? user.email?.[0] ?? 'U').toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    void nav('/profile');
                  }}
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    void nav('/my-links');
                  }}
                >
                  My Links
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    void logout()
                      .then(() => nav('/'))
                      .catch(() => {});
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
}
