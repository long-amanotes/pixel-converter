import React, { ReactElement, ReactNode, useMemo, useState, memo, useCallback } from 'react';
import { Badge, Box, Paper, Tab, Tabs, Typography } from '@mui/material';

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
    <Paper
      elevation={0}
      sx={{
        width,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: (theme) => theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50',
        }}
      >
        <Typography 
          variant="subtitle1" 
          fontWeight={600}
          sx={{
            fontSize: '0.9375rem',
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
      </Box>

      <Tabs
        value={activeIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Sidebar navigation tabs"
        sx={{
          px: 1.5,
          py: 0.5,
          minHeight: 44,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': { 
            minHeight: 40,
            fontWeight: 500,
            fontSize: '0.8125rem',
            textTransform: 'none',
            transition: 'all 0.15s ease',
            borderRadius: '8px',
            mx: 0.25,
            px: 1.5,
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'grey.100',
              color: 'text.primary',
            },
            '&.Mui-selected': {
              color: 'primary.main',
              fontWeight: 600,
            },
          },
          '& .MuiTabs-indicator': {
            height: 2,
            borderRadius: '2px 2px 0 0',
            bgcolor: 'primary.main',
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
                  sx={{ '& .MuiBadge-badge': { fontWeight: 700, fontSize: '0.65rem' } }}
                >
                  {t.icon || <Box sx={{ width: 20, height: 20 }} />}
                </Badge>
              ),
            })}
          />
        ))}
      </Tabs>

      <Box
        role="tabpanel"
        aria-labelledby={`tab-${tabs[activeIndex]?.id}`}
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'grey.50',
        }}
      >
        {tabs[activeIndex]?.content}
      </Box>
    </Paper>
  );
});

