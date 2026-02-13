/**
 * HeaderComponent - Metronic 9 inspired header with branding
 */

import React, { useContext } from 'react';
import { Box, Typography, IconButton, Tooltip, alpha, Chip } from '@mui/material';
import {
  DarkModeOutlined,
  LightModeOutlined,
  HelpOutline,
  MenuBook as GuideIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';
import { ColorModeContext } from '../../contexts/color-mode';

type HeaderComponentProps = {
  onOpenHelp?: () => void;
  onOpenGuide?: () => void;
};

export const HeaderComponent: React.FC<HeaderComponentProps> = ({ onOpenHelp, onOpenGuide }) => {
  const { mode, setMode } = useContext(ColorModeContext);
  const isDark = mode === 'dark';

  return (
    <Box
      component="header"
      sx={{
        height: 56,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: isDark ? '#1B1B29' : '#FFFFFF',
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
      }}
    >
      {/* Logo & Brand */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3E97FF 0%, #7239EA 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(62, 151, 255, 0.3)',
          }}
        >
          <Typography
            sx={{
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.125rem',
              fontFamily: 'monospace',
            }}
          >
            PX
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              color: 'text.primary',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Pixel Converter
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.6875rem',
              fontWeight: 500,
            }}
          >
            Transform images to pixel art
          </Typography>
        </Box>
        <Chip
          label="v1.0"
          size="small"
          sx={{
            height: 22,
            fontSize: '0.6875rem',
            fontWeight: 600,
            bgcolor: isDark ? alpha('#3E97FF', 0.15) : alpha('#3E97FF', 0.1),
            color: 'primary.main',
            border: 'none',
            ml: 1,
          }}
        />
      </Box>

      {/* Right Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="View on GitHub" arrow>
          <IconButton
            size="small"
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: isDark ? alpha('#FFFFFF', 0.05) : 'grey.100',
              color: 'text.secondary',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: isDark ? alpha('#FFFFFF', 0.1) : 'grey.200',
                color: 'text.primary',
              },
            }}
          >
            <GitHubIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`} arrow>
          <IconButton
            size="small"
            onClick={setMode}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: isDark ? alpha('#FFFFFF', 0.05) : 'grey.100',
              color: 'text.secondary',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: isDark ? alpha('#FFFFFF', 0.1) : 'grey.200',
                color: 'text.primary',
              },
            }}
          >
            {isDark ? (
              <LightModeOutlined sx={{ fontSize: 18 }} />
            ) : (
              <DarkModeOutlined sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>

        {onOpenGuide && (
          <Tooltip title="Hướng dẫn sử dụng" arrow>
            <IconButton
              size="small"
              onClick={onOpenGuide}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: isDark ? alpha('#FFFFFF', 0.05) : 'grey.100',
                color: 'text.secondary',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: isDark ? alpha('#3E97FF', 0.15) : alpha('#3E97FF', 0.1),
                  color: 'primary.main',
                },
              }}
            >
              <GuideIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}

        {onOpenHelp && (
          <Tooltip title="Help & shortcuts" arrow>
            <IconButton
              size="small"
              onClick={onOpenHelp}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: isDark ? alpha('#FFFFFF', 0.05) : 'grey.100',
                color: 'text.secondary',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: isDark ? alpha('#FFFFFF', 0.1) : 'grey.200',
                  color: 'text.primary',
                },
              }}
            >
              <HelpOutline sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};
