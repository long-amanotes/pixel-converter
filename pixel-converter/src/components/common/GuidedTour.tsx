/**
 * GuidedTour - FTUE (First Time User Experience) component
 * Provides interactive walkthrough of all features
 */

import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';
import { useTheme, alpha } from '@mui/material';

export type GuidedTourProps = {
  run: boolean;
  onFinish: () => void;
};

const TOUR_STORAGE_KEY = 'pixel-converter-tour-completed';

export const useGuidedTour = () => {
  const [showTour, setShowTour] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      setHasSeenTour(false);
      // Auto-start tour for first-time users after a short delay
      const timer = setTimeout(() => setShowTour(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => setShowTour(true);
  
  const finishTour = () => {
    setShowTour(false);
    setHasSeenTour(true);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setHasSeenTour(false);
  };

  return { showTour, startTour, finishTour, hasSeenTour, resetTour };
};

export const GuidedTour: React.FC<GuidedTourProps> = ({ run, onFinish }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>👋 Chào mừng đến Pixel Converter!</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.85 }}>
            Hãy cùng khám phá các tính năng chính của ứng dụng qua tour hướng dẫn này.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="upload-btn"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>📤 Tải ảnh lên</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.85 }}>
            Click vào đây để chọn ảnh từ máy tính. Bạn cũng có thể kéo thả ảnh vào canvas hoặc dán bằng Ctrl+V.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="mode-selector"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>🎨 Chế độ chỉnh sửa</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.85 }}>
            Chọn chế độ làm việc: Group (nhóm pixel), Type (loại màu), Paint (tô màu), hoặc Erase (xóa).
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="zoom-controls"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>🔍 Điều khiển Zoom</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.85 }}>
            Phóng to/thu nhỏ canvas để chỉnh sửa chi tiết. Bạn cũng có thể dùng scroll chuột.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="undo-btn"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>↩️ Hoàn tác</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.85 }}>
            Nhấn để hoàn tác thao tác vừa thực hiện. Phím tắt: Ctrl+Z
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="canvas-area"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>🖼️ Canvas</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.85 }}>
            Đây là vùng làm việc chính. Kéo chuột để chọn pixel, click để tương tác với từng pixel.
          </p>
        </div>
      ),
      placement: 'left',
      disableBeacon: true,
    },
    {
      target: '[data-tour="sidebar-tabs"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>📑 Sidebar Panels</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.85 }}>
            Chuyển đổi giữa các panel: Palette (bảng màu), Groups (nhóm), Types (loại), Data (dữ liệu), Export (xuất file).
          </p>
        </div>
      ),
      placement: 'left',
      disableBeacon: true,
    },
    {
      target: '[data-tour="palette-panel"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>🎨 Bảng màu</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.85 }}>
            Quản lý các màu trong ảnh. Click để chọn màu vẽ, double-click để chỉnh sửa màu.
          </p>
        </div>
      ),
      placement: 'left',
      disableBeacon: true,
    },
    {
      target: '[data-tour="theme-toggle"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>🌓 Đổi giao diện</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.85 }}>
            Chuyển đổi giữa chế độ sáng và tối theo sở thích của bạn.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="guide-btn"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>📖 Hướng dẫn chi tiết</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.85 }}>
            Click vào đây bất cứ lúc nào để xem hướng dẫn sử dụng đầy đủ.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>🎉 Hoàn thành!</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.85 }}>
            Bạn đã sẵn sàng sử dụng Pixel Converter. Hãy bắt đầu bằng cách tải một ảnh lên!
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
  ];

  const handleCallback = (data: CallBackProps) => {
    const { status, action, type } = data;
    
    if (
      status === STATUS.FINISHED || 
      status === STATUS.SKIPPED ||
      (action === ACTIONS.CLOSE && type === EVENTS.STEP_AFTER)
    ) {
      onFinish();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableOverlayClose
      callback={handleCallback}
      locale={{
        back: 'Quay lại',
        close: 'Đóng',
        last: 'Hoàn thành',
        next: 'Tiếp theo',
        skip: 'Bỏ qua',
      }}
      styles={{
        options: {
          primaryColor: '#3E97FF',
          backgroundColor: isDark ? '#1B1B29' : '#FFFFFF',
          textColor: isDark ? '#FFFFFF' : '#1B1B29',
          arrowColor: isDark ? '#1B1B29' : '#FFFFFF',
          overlayColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          border: `1px solid ${isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.08)}`,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: '1rem',
          fontWeight: 600,
        },
        tooltipContent: {
          fontSize: '0.875rem',
          padding: 0,
        },
        buttonNext: {
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '0.875rem',
          fontWeight: 600,
          background: 'linear-gradient(135deg, #3E97FF 0%, #2884EF 100%)',
        },
        buttonBack: {
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: isDark ? '#FFFFFF' : '#1B1B29',
          marginRight: 8,
        },
        buttonSkip: {
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: isDark ? alpha('#FFFFFF', 0.6) : alpha('#000000', 0.5),
        },
        buttonClose: {
          color: isDark ? '#FFFFFF' : '#1B1B29',
        },
        spotlight: {
          borderRadius: 8,
        },
        beacon: {
          display: 'none',
        },
      }}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
};
