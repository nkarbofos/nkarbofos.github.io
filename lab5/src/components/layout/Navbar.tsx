import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Archive } from '@mui/icons-material';

const Navbar: React.FC = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar
        sx={{
          width: '100%',
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          gap: { xs: 1, sm: 0 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Archive sx={{ mr: { xs: 1, sm: 2 } }} />
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: { xs: 1, sm: 0 },
            textDecoration: 'none',
            color: 'inherit',
            mr: { xs: 0, sm: 4 },
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            Архивы Проектов
          </Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
            Архивы
          </Box>
        </Typography>

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            gap: { xs: 1, sm: 2 },
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
          }}
        >
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Архивы
          </Button>
          {currentUser && (
            <Button
              color="inherit"
              component={Link}
              to="/upload"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Загрузить
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
            flexWrap: 'nowrap',
          }}
        >
          {currentUser ? (
            <>
              <Typography
                variant="body2"
                sx={{
                  display: { xs: 'none', md: 'block' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                {userData?.firstName && userData?.lastName
                  ? `${userData.firstName} ${userData.lastName}`
                  : currentUser.email}
              </Typography>
              <Avatar
                sx={{
                  bgcolor: 'secondary.main',
                  cursor: 'pointer',
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                }}
                onClick={handleMenu}
              >
                {userData?.firstName
                  ? userData.firstName[0].toUpperCase()
                  : (currentUser.email || 'U')[0].toUpperCase()}
              </Avatar>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate('/profile');
                  }}
                >
                  Профиль
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate('/my-links');
                  }}
                >
                  Мои ссылки
                </MenuItem>
                <MenuItem onClick={handleLogout}>Выйти</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}
              >
                Войти
              </Button>
              <Button
                color="inherit"
                variant="outlined"
                component={Link}
                to="/register"
                sx={{
                  borderColor: 'white',
                  '&:hover': { borderColor: 'white' },
                  fontSize: { xs: '0.75rem', sm: '1rem' },
                  px: { xs: 1, sm: 2 },
                }}
              >
                Регистрация
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;


