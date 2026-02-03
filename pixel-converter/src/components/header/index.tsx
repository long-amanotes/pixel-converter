import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import BrushIcon from '@mui/icons-material/Brush';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useGetIdentity } from '@refinedev/core';
import { HamburgerMenu, RefineThemedLayoutHeaderProps } from '@refinedev/mui';
import React, { useContext } from 'react';
import { ColorModeContext } from '../../contexts/color-mode';

type IUser = {
  id: number;
  name: string;
  avatar: string;
};

export const Header: React.FC<RefineThemedLayoutHeaderProps> = ({ sticky = true }) => {
  const { mode, setMode } = useContext(ColorModeContext);

  const { data: user } = useGetIdentity<IUser>();

  return (
    <AppBar 
      position={sticky ? 'sticky' : 'relative'}
      elevation={0}
      sx={{
        backdropFilter: 'blur(8px)',
        backgroundColor: mode === 'dark' 
          ? 'rgba(18, 18, 18, 0.95)' 
          : 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, sm: 70 }, px: { xs: 2, sm: 3 } }}>
        <Stack 
          direction="row" 
          width="100%" 
          justifyContent="space-between" 
          alignItems="center"
          spacing={2}
        >
          {/* Left: Logo & Title */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <HamburgerMenu />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(33, 150, 243, 0.08) 0%, rgba(156, 39, 176, 0.08) 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(156, 39, 176, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(33, 150, 243, 0.12) 0%, rgba(156, 39, 176, 0.12) 100%)',
                },
              }}
            >
              <BrushIcon 
                sx={{ 
                  fontSize: 28,
                  color: 'primary.main',
                  filter: 'drop-shadow(0 2px 4px rgba(33, 150, 243, 0.3))',
                }} 
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  background: mode === 'dark'
                    ? 'linear-gradient(135deg, #2196F3 0%, #9C27B0 100%)'
                    : 'linear-gradient(135deg, #1976D2 0%, #7B1FA2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Pixel Art Converter
              </Typography>
            </Box>
          </Stack>

          {/* Right: Controls & User */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              color="inherit"
              onClick={setMode}
              aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
              sx={{
                borderRadius: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'rotate(180deg) scale(1.1)',
                  backgroundColor: mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)' 
                    : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              {mode === 'dark' ? (
                <LightModeOutlined sx={{ fontSize: 22 }} />
              ) : (
                <DarkModeOutlined sx={{ fontSize: 22 }} />
              )}
            </IconButton>

            {(user?.avatar || user?.name) && (
              <Stack 
                direction="row" 
                spacing={1.5} 
                alignItems="center"
                sx={{
                  ml: 1,
                  pl: 1.5,
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {user?.name && (
                  <Typography
                    variant="body2"
                    sx={{
                      display: { xs: 'none', sm: 'inline-block' },
                      fontWeight: 500,
                      color: 'text.primary',
                    }}
                  >
                    {user?.name}
                  </Typography>
                )}
                <Avatar 
                  src={user?.avatar} 
                  alt={user?.name}
                  sx={{
                    width: 36,
                    height: 36,
                    border: '2px solid',
                    borderColor: 'primary.main',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                    },
                  }}
                />
              </Stack>
            )}
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
