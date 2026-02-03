import React, { ReactElement, ReactNode, useMemo, useState } from 'react';
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

export const TabbedSidebar: React.FC<TabbedSidebarProps> = ({
  title = 'Panels',
  width = 360,
  tabs,
  initialTabId,
  onTabChange,
}) => {
  const tabIds = useMemo(() => tabs.map((t) => t.id), [tabs]);

  const [activeTabId, setActiveTabId] = useState(() => {
    if (initialTabId && tabIds.includes(initialTabId)) return initialTabId;
    return tabIds[0] ?? '';
  });

  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === activeTabId)
  );

  return (
    <Paper
      elevation={3}
      sx={{
        width,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          pt: 2.5,
          pb: 1.5,
          borderBottom: '2px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          },
        }}
      >
        <Typography 
          variant="subtitle1" 
          fontWeight={700}
          sx={{
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontSize: '0.875rem',
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
      </Box>

      <Tabs
        value={activeIndex}
        onChange={(_e, nextIndex: number) => {
          const next = tabs[nextIndex];
          if (!next) return;
          setActiveTabId(next.id);
          onTabChange?.(next.id);
        }}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          px: 1,
          minHeight: 48,
          bgcolor: 'background.paper',
          '& .MuiTab-root': { 
            minHeight: 48,
            fontWeight: 600,
            fontSize: '0.8125rem',
            textTransform: 'none',
            transition: 'all 0.3s ease',
            borderRadius: 2,
            mx: 0.5,
            '&:hover': {
              bgcolor: 'action.hover',
              transform: 'translateY(-2px)',
            },
            '&.Mui-selected': {
              color: 'primary.main',
              bgcolor: 'action.selected',
            },
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            background: 'linear-gradient(90deg, #2196F3 0%, #9C27B0 100%)',
          },
        }}
      >
        {tabs.map((t) => (
          <Tab
            key={t.id}
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
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'background.default',
        }}
      >
        {tabs[activeIndex]?.content}
      </Box>
    </Paper>
  );
};

