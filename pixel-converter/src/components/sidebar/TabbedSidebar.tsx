import React, { ReactElement, ReactNode, useMemo, useState, memo, useCallback } from 'react';
import { Badge, Box, Tab, Tabs, Typography, alpha, useTheme } from '@mui/material';

export type SidebarTabItem = {
  id: string;
  label: string;
  icon?: string | ReactElement;
  badgeCount?: number;
  content: ReactNode;
};

type TabbedSidebarProps = {
  title?: string;
  width?: number;
  tabs: SidebarTabItem[];
  initialTabId?: string;
  onTabChange?: (tabId: string) => void;
};

export const TabbedSidebar: React.FC<TabbedSidebarProps> = memo(function TabbedSidebar({
  title = 'Panels',
  width = 360,
  tabs,
  initialTabId,
  onTabChange,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const tabIds = useMemo(() => tabs.map((t) => t.id), [tabs]);

  const [activeTabId, setActiveTabId] = useState(() => {
    if (initialTabId && tabIds.includes(initialTabId)) return initialTabId;
    return tabIds[0] ?? '';
  });

  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === activeTabId)
  );

  const handleTabChange = useCallback(
    (_e: React.SyntheticEvent, nextIndex: number) => {
      const next = tabs[nextIndex];
      if (!next) return;
      setActiveTabId(next.id);
      onTabChange?.(next.id);
    },
    [tabs, onTabChange]
  );

  return (
    <Box
      sx={{
        width,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: isDark ? '#1B1B29' : '#FFFFFF',
        boxShadow: isDark 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: isDark ? alpha('#FFFFFF', 0.02) : alpha('#000000', 0.01),
        }}
      >
        <Typography 
          variant="subtitle2" 
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        data-tour="sidebar-tabs"
        sx={{
          minHeight: 44,
          bgcolor: isDark ? alpha('#FFFFFF', 0.02) : alpha('#000000', 0.01),
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTabs-flexContainer': {
            gap: 0,
          },
          '& .MuiTab-root': { 
            minHeight: 44,
            minWidth: 'auto',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'none',
            transition: 'all 0.15s ease',
            px: 2,
            py: 1.25,
            color: 'text.secondary',
            '&:hover': {
              bgcolor: isDark ? alpha('#FFFFFF', 0.05) : alpha('#000000', 0.03),
              color: 'text.primary',
            },
            '&.Mui-selected': {
              color: 'primary.main',
              bgcolor: isDark ? alpha('#3E97FF', 0.1) : alpha('#3E97FF', 0.06),
            },
          },
          '& .MuiTabs-indicator': {
            height: 2,
            bgcolor: 'primary.main',
            borderRadius: '2px 2px 0 0',
          },
        }}
      >
        {tabs.map((t, index) => (
          <Tab
            key={t.id}
            id={`tab-${t.id}`}
            aria-controls={`tabpanel-${t.id}`}
            aria-selected={index === activeIndex}
            {...(t.icon && { icon: t.icon })}
            {...(t.icon && { iconPosition: 'start' as const })}
            label={t.label}
            {...(typeof t.badgeCount === 'number' && {
              icon: (
                <Badge
                  color="primary"
                  badgeContent={t.badgeCount}
                  max={999}
                  sx={{ '& .MuiBadge-badge': { fontWeight: 700, fontSize: '0.6rem' } }}
                >
                  {t.icon || <Box sx={{ width: 18, height: 18 }} />}
                </Badge>
              ),
            })}
          />
        ))}
      </Tabs>

      {/* Content */}
      <Box
        role="tabpanel"
        aria-labelledby={`tab-${tabs[activeIndex]?.id}`}
        data-tour="palette-panel"
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          p: 2,
          bgcolor: isDark ? '#151521' : '#F8F9FA',
        }}
      >
        {tabs[activeIndex]?.content}
      </Box>
    </Box>
  );
});

