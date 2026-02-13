/**
 * GuidedTour - FTUE (First Time User Experience) component
 * Provides interactive walkthrough of all features with tab navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';
import { useTheme, alpha } from '@mui/material';

export type GuidedTourProps = {
  run: boolean;
  onFinish: () => void;
  onTabChange?: (tabId: string) => void;
};

const TOUR_STORAGE_KEY = 'pixel-converter-tour-completed';

// Map step index to tab that should be active
const STEP_TAB_MAP: Record<number, string> = {
  7: 'palette',   // Palette panel step
  8: 'groups',    // Groups tab step
  9: 'types',     // Types tab step
  10: 'data',     // Data tab step
  11: 'export',   // Export tab step
};

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
    return undefined;
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

export const GuidedTour: React.FC<GuidedTourProps> = ({ run, onFinish, onTabChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const steps: Step[] = [
    // 0: Welcome
    {
      target: 'body',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>👋 Chào mừng đến Pixel Converter!</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.85 }}>
            Hãy cùng khám phá các tính năng chính của ứng dụng qua tour hướng dẫn này. Tour sẽ đi qua từng phần của giao diện.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },

    // 1: Upload
    {
      target: '[data-tour="upload-btn"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>📤 Tải ảnh lên</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', opacity: 0.85 }}>
            Click vào đây để chọn ảnh từ máy tính.
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, fontStyle: 'italic' }}>
            💡 Mẹo: Bạn cũng có thể kéo thả ảnh vào canvas hoặc dán bằng Ctrl+V
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },

    // 2: Undo
    {
      target: '[data-tour="undo-btn"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>↩️ Hoàn tác (Undo)</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', opacity: 0.85 }}>
            Nhấn để hoàn tác thao tác vừa thực hiện. Số trong ngoặc cho biết số thao tác có thể undo.
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, fontStyle: 'italic' }}>
            ⌨️ Phím tắt: Ctrl+Z
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },

    // 3: Mode selector
    {
      target: '[data-tour="mode-selector"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>🎨 Chế độ chỉnh sửa</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', opacity: 0.85 }}>
            Chọn chế độ làm việc phù hợp với công việc của bạn:
          </p>
          <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px', fontSize: '0.8rem', opacity: 0.85 }}>
            <li><strong style={{ color: '#50CD89' }}>Group</strong>: Nhóm pixel vào data group</li>
            <li><strong style={{ color: '#7239EA' }}>Type</strong>: Gán loại màu cho pixel</li>
            <li><strong style={{ color: '#3E97FF' }}>Paint</strong>: Tô màu lên pixel</li>
            <li><strong style={{ color: '#F1416C' }}>Erase</strong>: Xóa pixel</li>
          </ul>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },

    // 4: Zoom
    {
      target: '[data-tour="zoom-controls"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>🔍 Điều khiển Zoom</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', opacity: 0.85 }}>
            Kéo thanh trượt để phóng to/thu nhỏ canvas. Phạm vi từ 10% đến 200%.
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, fontStyle: 'italic' }}>
            💡 Mẹo: Dùng scroll chuột trên canvas để zoom nhanh hơn
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },

    // 5: Canvas
    {
      target: '[data-tour="canvas-area"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>🖼️ Canvas - Vùng làm việc chính</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', opacity: 0.85 }}>
            Đây là nơi hiển thị và chỉnh sửa pixel art của bạn.
          </p>
          <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px', fontSize: '0.8rem', opacity: 0.85 }}>
            <li><strong>Kéo chuột</strong>: Chọn vùng pixel</li>
            <li><strong>Click</strong>: Chọn/tương tác pixel đơn lẻ</li>
            <li><strong>Kéo thả ảnh</strong>: Tải ảnh mới</li>
          </ul>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, fontStyle: 'italic' }}>
            💡 Nền ô vuông giúp bạn nhận biết vùng trong suốt
          </p>
        </div>
      ),
      placement: 'left',
      disableBeacon: true,
    },

    // 6: Sidebar overview
    {
      target: '[data-tour="sidebar-tabs"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>📑 Workspace Tabs</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', opacity: 0.85 }}>
            Sidebar chứa 5 panel chức năng. Hãy cùng khám phá từng tab!
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.8rem', opacity: 0.85 }}>
            <li><strong>Palette</strong>: Quản lý bảng màu</li>
            <li><strong>Groups</strong>: Xem nhóm màu tự động</li>
            <li><strong>Types</strong>: Quản lý loại màu</li>
            <li><strong>Data</strong>: Quản lý data groups</li>
            <li><strong>Export</strong>: Xuất/nhập file</li>
          </ul>
        </div>
      ),
      placement: 'left',
      disableBeacon: true,
    },

    // 7: Palette panel (will switch to palette tab)
    {
      target: '[data-tour="panel-palette"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>🎨 Tab Palette - Bảng màu</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', opacity: 0.85 }}>
            Quản lý bảng màu của ảnh pixel art:
          </p>
          <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px', fontSize: '0.8rem', opacity: 0.85 }}>
            <li><strong>Ô màu</strong>: Click để mở color picker</li>
            <li><strong>Mã HEX</strong>: Nhập trực tiếp mã màu</li>
            <li><strong>Nút Copy</strong>: Sao chép mã màu vào clipboard</li>
            <li><strong>Nút Delete</strong>: Xóa màu khỏi palette</li>
            <li><strong>Add Color</strong>: Thêm màu mới vào palette</li>
          </ul>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, fontStyle: 'italic' }}>
            💡 Khi thay đổi màu, các pixel sử dụng màu đó sẽ tự động cập nhật
          </p>
        </div>
      ),
      placement: 'left',
      disableBeacon: true,
    },

    // 8: Groups panel (will switch to groups tab)
    {
      target: '[data-tour="panel-groups"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>🎯 Tab Groups - Nhóm màu tự động</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', opacity: 0.85 }}>
            Hệ thống tự động nhóm các pixel theo màu sắc:
          </p>
          <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px', fontSize: '0.8rem', opacity: 0.85 }}>
            <li>Hiển thị tất cả màu có trong ảnh</li>
            <li>Số lượng pixel cho mỗi màu</li>
            <li><strong>Click vào nhóm</strong>: Lọc/highlight pixel trên canvas</li>
            <li><strong>Click lần nữa</strong>: Bỏ lọc</li>
          </ul>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, fontStyle: 'italic' }}>
            💡 Hữu ích để xem phân bố màu trong ảnh
          </p>
        </div>
      ),
      placement: 'left',
      disableBeacon: true,
    },

    // 9: Types panel (will switch to types tab)
    {
      target: '[data-tour="panel-types"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>🏷️ Tab Types - Phân loại màu</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', opacity: 0.85 }}>
            Gán nhãn/loại cho các pixel (ví dụ: nền, viền, highlight):
          </p>
          <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px', fontSize: '0.8rem', opacity: 0.85 }}>
            <li><strong>Tạo type mới</strong>: Nhập tên và chọn màu đại diện</li>
            <li><strong>Gán pixel</strong>: Chọn mode "Type" ở toolbar, kéo chọn vùng trên canvas</li>
            <li><strong>Xem thống kê</strong>: Số pixel thuộc mỗi type</li>
            <li><strong>Click type</strong>: Highlight pixel thuộc type đó</li>
          </ul>
        </div>
      ),
      placement: 'left',
      disableBeacon: true,
    },

    // 10: Data panel (will switch to data tab)
    {
      target: '[data-tour="panel-data"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>📦 Tab Data - Nhóm dữ liệu</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', opacity: 0.85 }}>
            Tổ chức pixel thành các nhóm dữ liệu có ý nghĩa:
          </p>
          <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px', fontSize: '0.8rem', opacity: 0.85 }}>
            <li><strong>Tạo group</strong>: Nhập tên cho nhóm pixel</li>
            <li><strong>Gán pixel</strong>: Chọn mode "Group" ở toolbar, kéo chọn vùng</li>
            <li><strong>Ứng dụng</strong>: Phân vùng sprite, tách layer, đánh dấu vùng</li>
          </ul>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, fontStyle: 'italic' }}>
            💡 Data groups được lưu khi export JSON, giúp bạn tiếp tục công việc sau
          </p>
        </div>
      ),
      placement: 'left',
      disableBeacon: true,
    },

    // 11: Export panel (will switch to export tab)
    {
      target: '[data-tour="panel-export"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>💾 Tab Export - Xuất/Nhập file</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', opacity: 0.85 }}>
            Lưu và chia sẻ công việc của bạn:
          </p>
          <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px', fontSize: '0.8rem', opacity: 0.85 }}>
            <li><strong>Export JSON</strong>: Lưu toàn bộ dữ liệu (pixel, palette, groups, types)</li>
            <li><strong>Export PNG</strong>: Xuất ảnh pixel art thành file ảnh</li>
            <li><strong>Import JSON</strong>: Tải lại project đã lưu trước đó</li>
            <li><strong>Clear Data</strong>: Xóa dữ liệu đã lưu trong trình duyệt</li>
          </ul>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, fontStyle: 'italic' }}>
            💡 Dữ liệu tự động lưu vào localStorage khi bạn làm việc
          </p>
        </div>
      ),
      placement: 'left',
      disableBeacon: true,
    },

    // 12: Theme toggle
    {
      target: '[data-tour="theme-toggle"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>🌓 Đổi giao diện</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.85 }}>
            Chuyển đổi giữa chế độ sáng (Light) và tối (Dark) theo sở thích của bạn.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },

    // 13: Guide button
    {
      target: '[data-tour="guide-btn"]',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>📖 Hướng dẫn chi tiết</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', opacity: 0.85 }}>
            Click vào đây bất cứ lúc nào để:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.8rem', opacity: 0.85 }}>
            <li>Xem hướng dẫn sử dụng đầy đủ</li>
            <li>Tra cứu phím tắt</li>
            <li>Chạy lại tour hướng dẫn này</li>
          </ul>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },

    // 14: Finish
    {
      target: 'body',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>🎉 Hoàn thành tour!</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', opacity: 0.85 }}>
            Bạn đã sẵn sàng sử dụng Pixel Converter. Hãy bắt đầu bằng cách tải một ảnh lên!
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, fontStyle: 'italic' }}>
            💡 Nhấn nút 📖 trên header để xem lại hướng dẫn hoặc chạy lại tour bất cứ lúc nào.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
  ];

  const handleCallback = useCallback((data: CallBackProps) => {
    const { status, action, type, index } = data;
    
    // Switch tab when entering specific steps
    if (type === EVENTS.STEP_BEFORE && onTabChange) {
      const tabId = STEP_TAB_MAP[index];
      if (tabId) {
        // Small delay to ensure smooth animation
        setTimeout(() => {
          onTabChange(tabId);
        }, 50);
      }
    }
    
    if (
      status === STATUS.FINISHED || 
      status === STATUS.SKIPPED ||
      (action === ACTIONS.CLOSE && type === EVENTS.STEP_AFTER)
    ) {
      // Reset to palette tab when tour ends
      if (onTabChange) {
        onTabChange('palette');
      }
      onFinish();
    }
  }, [onFinish, onTabChange]);

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
        skip: 'Bỏ qua tour',
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
          maxWidth: 420,
          animation: 'fadeIn 0.3s ease-out',
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
          padding: '10px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          background: 'linear-gradient(135deg, #3E97FF 0%, #2884EF 100%)',
          transition: 'all 0.2s ease',
        },
        buttonBack: {
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: isDark ? '#FFFFFF' : '#1B1B29',
          marginRight: 8,
          transition: 'all 0.2s ease',
        },
        buttonSkip: {
          borderRadius: 8,
          padding: '10px 16px',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: isDark ? alpha('#FFFFFF', 0.6) : alpha('#000000', 0.5),
          transition: 'all 0.2s ease',
        },
        buttonClose: {
          color: isDark ? '#FFFFFF' : '#1B1B29',
        },
        spotlight: {
          borderRadius: 8,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        overlay: {
          transition: 'background-color 0.3s ease',
        },
        beacon: {
          display: 'none',
        },
      }}
      floaterProps={{
        disableAnimation: false,
        styles: {
          floater: {
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      }}
    />
  );
};
