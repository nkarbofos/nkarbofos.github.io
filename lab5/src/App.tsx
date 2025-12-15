import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ArchiveUpload from './components/upload/ArchiveUpload';
import ArchiveList from './components/archive/ArchiveList';
import ArchiveFilters from './components/archive/ArchiveFilters';
import Profile from './components/profile/Profile';
import UserProfile from './components/profile/UserProfile';
import MyLinks from './components/profile/MyLinks';
import { getBasePath } from './utils/paths';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Box textAlign="center">
          <Box sx={{ mb: 2 }}>
            <CircularProgress />
          </Box>
          <Typography>Загрузка...</Typography>
        </Box>
      </Box>
    );
  }

  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

// Home Page Component
const HomePage: React.FC = () => {
  const [filters, setFilters] = useState<{ tags?: string[]; userId?: string }>({});

  const handleFiltersChange = useCallback(
    (newFilters: { tags?: string[]; userId?: string }) => {
      setFilters(newFilters);
    },
    []
  );

  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
      }}
    >
      <ArchiveFilters onFiltersChange={handleFiltersChange} />
      <ArchiveList filters={filters} />
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router basename={getBasePath().replace(/\/$/, '')}>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <ArchiveUpload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-links"
                  element={
                    <ProtectedRoute>
                      <MyLinks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/:userId"
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<HomePage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
