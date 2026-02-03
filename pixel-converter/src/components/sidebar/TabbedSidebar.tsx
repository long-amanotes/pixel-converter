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
      elevation={2}
      sx={{
        width,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
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
          minHeight: 44,
          '& .MuiTab-root': { minHeight: 44 },
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

