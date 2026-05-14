import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  CssBaseline,
  GlobalStyles,
  ThemeProvider,
  Typography,
} from '@mui/material';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ArchiveHomePage from './pages/ArchiveHomePage';
import UploadPage from './pages/UploadPage';
import ProfilePage from './pages/ProfilePage';
import MyLinksPage from './pages/MyLinksPage';
import UserProfilePage from './pages/UserProfilePage';
import ProjectPage from './pages/ProjectPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import { useAuth } from './state/AuthContext';
import { appTheme } from './theme';
import { useLocation } from 'react-router-dom';

function Protected({ children }: { children: React.ReactNode }) {
  const { userDb, loading } = useAuth();
  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Box textAlign="center">
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading...</Typography>
        </Box>
      </Box>
    );
  if (!userDb) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { userDb } = useAuth();
  if (userDb?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Sidebar() {
  const { userDb } = useAuth();
  if (!userDb) return null;
  return (
    <Box
      component="aside"
      sx={{
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        width: 240,
        bgcolor: '#f6f3f2',
        p: 2,
        borderRight: '1px solid rgba(116,118,133,0.15)',
        position: 'sticky',
        top: 72,
        height: 'calc(100vh - 72px)',
        gap: 1,
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Workspace
      </Typography>
      <Typography variant="body2">My Projects</Typography>
      <Typography variant="body2">Achievements</Typography>
      <Typography variant="body2">Analytics</Typography>
      <Typography variant="body2">Settings</Typography>
    </Box>
  );
}

export default function App() {
  const location = useLocation();
  const hideSidebar = ['/login', '/register'].includes(location.pathname);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '::-webkit-scrollbar': { width: 4, height: 4 },
          '::-webkit-scrollbar-thumb': {
            backgroundColor: '#c4c5d6',
            borderRadius: 8,
          },
          '.glass-panel': {
            background: 'rgba(252, 248, 248, 0.7)',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar />
        <Box sx={{ display: 'flex', maxWidth: 1400, mx: 'auto', width: '100%' }}>
          {!hideSidebar ? <Sidebar /> : null}
          <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
            <Routes>
              <Route path="/" element={<ArchiveHomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/upload"
                element={
                  <Protected>
                    <UploadPage />
                  </Protected>
                }
              />
              <Route
                path="/profile"
                element={
                  <Protected>
                    <ProfilePage />
                  </Protected>
                }
              />
              <Route
                path="/my-links"
                element={
                  <Protected>
                    <MyLinksPage />
                  </Protected>
                }
              />
              <Route path="/user/:userId" element={<UserProfilePage />} />
              <Route path="/project/:linkId" element={<ProjectPage />} />
              <Route
                path="/teacher"
                element={
                  <Protected>
                    <AdminOnly>
                      <TeacherDashboardPage />
                    </AdminOnly>
                  </Protected>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
