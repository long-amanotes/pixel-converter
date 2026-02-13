/**
 * UserGuideDialog - Comprehensive feature guide dialog
 * Provides detailed instructions for all app features
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  alpha,
  useTheme,
  IconButton,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  CloudUpload as UploadIcon,
  Palette as PaletteIcon,
  Category as CategoryIcon,
  DataObject as DataIcon,
  FileDownload as ExportIcon,
  Brush as BrushIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';

export type UserGuideDialogProps = {
  open: boolean;
  onClose: () => void;
  onStartTour?: () => void;
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ py: 2 }}>
    {value === index && children}
  </Box>
);

export const UserGuideDialog: React.FC<UserGuideDialogProps> = ({ open, onClose, onStartTour }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [tabValue, setTabValue] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const cardStyle = {
    p: 2,
    borderRadius: '10px',
    bgcolor: isDark ? alpha('#FFFFFF', 0.03) : alpha('#000000', 0.02),
    border: '1px solid',
    borderColor: isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.04),
    mb: 2,
  };

  const kbdStyle = {
    fontFamily: 'monospace',
    fontSize: '0.6875rem',
    fontWeight: 600,
    bgcolor: isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.06),
    color: 'text.primary',
    px: 1,
    py: 0.5,
    borderRadius: '4px',
    border: '1px solid',
    borderColor: isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.08),
  };

  const quickStartSteps = [
    {
      label: 'Tải ảnh lên',
      description: 'Click nút Upload hoặc kéo thả ảnh vào canvas. Bạn cũng có thể dán ảnh từ clipboard bằng Ctrl+V.',
      icon: <UploadIcon />,
    },
    {
      label: 'Chỉnh sửa pixel',
      description: 'Chọn chế độ Paint để tô màu, Erase để xóa pixel, hoặc Group/Type để phân loại pixel.',
      icon: <BrushIcon />,
    },
    {
      label: 'Quản lý palette',
      description: 'Sử dụng tab Palette ở sidebar để thêm, xóa hoặc chỉnh sửa màu sắc.',
      icon: <PaletteIcon />,
    },
    {
      label: 'Xuất kết quả',
      description: 'Vào tab Export để xuất ảnh PNG hoặc dữ liệu JSON.',
      icon: <ExportIcon />,
    },
  ];

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleReset = () => setActiveStep(0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: isDark ? '#1B1B29' : '#FFFFFF',
          maxHeight: '85vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: isDark ? alpha('#FFFFFF', 0.02) : alpha('#000000', 0.01),
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3E97FF 0%, #7239EA 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.125rem',
            }}
          >
            📖
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Hướng dẫn sử dụng
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            bgcolor: isDark ? alpha('#FFFFFF', 0.05) : alpha('#000000', 0.04),
            '&:hover': {
              bgcolor: isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.08),
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              minHeight: 48,
            },
          }}
        >
          <Tab label="Bắt đầu nhanh" />
          <Tab label="Chế độ chỉnh sửa" />
          <Tab label="Sidebar & Panels" />
          <Tab label="Phím tắt" />
        </Tabs>
      </Box>

      <DialogContent sx={{ py: 2, px: 3 }}>
        {/* Tab 0: Quick Start */}
        <TabPanel value={tabValue} index={0}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {quickStartSteps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        bgcolor: activeStep >= index
                          ? 'primary.main'
                          : isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.06),
                        color: activeStep >= index ? '#FFFFFF' : 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {step.icon}
                    </Box>
                  )}
                >
                  <Typography fontWeight={600} fontSize="0.875rem">{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      size="small"
                      startIcon={<PrevIcon />}
                      sx={{ textTransform: 'none' }}
                    >
                      Quay lại
                    </Button>
                    <Button
                      variant="contained"
                      onClick={index === quickStartSteps.length - 1 ? handleReset : handleNext}
                      size="small"
                      endIcon={index === quickStartSteps.length - 1 ? null : <NextIcon />}
                      sx={{ textTransform: 'none' }}
                    >
                      {index === quickStartSteps.length - 1 ? 'Bắt đầu lại' : 'Tiếp theo'}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </TabPanel>

        {/* Tab 1: Edit Modes */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={cardStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label="Group" size="small" sx={{ bgcolor: alpha('#50CD89', 0.2), color: '#50CD89', fontWeight: 600 }} />
              <Typography fontWeight={600} fontSize="0.875rem">Chế độ Group</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Kéo chuột để chọn vùng pixel và gán vào một nhóm dữ liệu. Hữu ích để phân loại các phần khác nhau của ảnh.
            </Typography>
          </Box>

          <Box sx={cardStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label="Type" size="small" sx={{ bgcolor: alpha('#7239EA', 0.2), color: '#7239EA', fontWeight: 600 }} />
              <Typography fontWeight={600} fontSize="0.875rem">Chế độ Type</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Gán loại màu cho các pixel đã chọn. Giúp phân biệt các loại màu khác nhau trong ảnh (ví dụ: màu nền, màu viền, màu chính).
            </Typography>
          </Box>

          <Box sx={cardStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label="Paint" size="small" sx={{ bgcolor: alpha('#3E97FF', 0.2), color: '#3E97FF', fontWeight: 600 }} />
              <Typography fontWeight={600} fontSize="0.875rem">Chế độ Paint</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Chọn màu từ palette và tô lên các pixel. Có thể chọn nhiều pixel cùng lúc bằng cách kéo chuột, sau đó áp dụng màu.
            </Typography>
          </Box>

          <Box sx={cardStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label="Erase" size="small" sx={{ bgcolor: alpha('#F1416C', 0.2), color: '#F1416C', fontWeight: 600 }} />
              <Typography fontWeight={600} fontSize="0.875rem">Chế độ Erase</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Xóa pixel đã chọn. Kéo chuột để chọn vùng cần xóa, sau đó click nút Erase để xóa.
            </Typography>
          </Box>
        </TabPanel>

        {/* Tab 2: Sidebar & Panels */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={cardStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PaletteIcon sx={{ color: 'primary.main' }} />
              <Typography fontWeight={600} fontSize="0.875rem">Palette</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Quản lý bảng màu của ảnh. Thêm màu mới, xóa màu không dùng, hoặc chỉnh sửa màu hiện có. Click vào màu để chọn làm màu vẽ.
            </Typography>
          </Box>

          <Box sx={cardStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CategoryIcon sx={{ color: '#7239EA' }} />
              <Typography fontWeight={600} fontSize="0.875rem">Groups & Types</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Quản lý các nhóm dữ liệu và loại màu. Tạo nhóm mới, đổi tên, hoặc xóa nhóm. Xem số lượng pixel trong mỗi nhóm.
            </Typography>
          </Box>

          <Box sx={cardStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <DataIcon sx={{ color: '#FFC700' }} />
              <Typography fontWeight={600} fontSize="0.875rem">Data</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Xem và quản lý dữ liệu pixel theo nhóm. Hiển thị thông tin chi tiết về từng nhóm dữ liệu.
            </Typography>
          </Box>

          <Box sx={cardStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ExportIcon sx={{ color: '#50CD89' }} />
              <Typography fontWeight={600} fontSize="0.875rem">Export/Import</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Xuất ảnh dưới dạng PNG hoặc dữ liệu JSON. Import dữ liệu JSON để tiếp tục chỉnh sửa. Hỗ trợ xuất với các tùy chọn khác nhau.
            </Typography>
          </Box>
        </TabPanel>

        {/* Tab 3: Shortcuts */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={cardStyle}>
            <Typography fontWeight={600} fontSize="0.875rem" sx={{ mb: 2 }}>Phím tắt chung</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Hoàn tác (Undo)</Typography>
                <Box component="span" sx={kbdStyle}>Ctrl + Z</Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Dán ảnh từ clipboard</Typography>
                <Box component="span" sx={kbdStyle}>Ctrl + V</Box>
              </Box>
            </Box>
          </Box>

          <Box sx={cardStyle}>
            <Typography fontWeight={600} fontSize="0.875rem" sx={{ mb: 2 }}>Điều khiển Canvas</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Phóng to/thu nhỏ</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Box component="span" sx={kbdStyle}>Scroll</Box>
                  <Typography variant="body2" color="text.secondary">hoặc</Typography>
                  <Box component="span" sx={kbdStyle}>+</Box>
                  <Box component="span" sx={kbdStyle}>-</Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Di chuyển canvas</Typography>
                <Box component="span" sx={kbdStyle}>Kéo chuột</Box>
              </Box>
            </Box>
          </Box>

          <Box sx={cardStyle}>
            <Typography fontWeight={600} fontSize="0.875rem" sx={{ mb: 2 }}>Mẹo sử dụng</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                • Kéo thả ảnh trực tiếp vào canvas để tải nhanh
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Double-click vào màu trong palette để chỉnh sửa
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Sử dụng zoom để chỉnh sửa chi tiết pixel
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Dữ liệu được tự động lưu vào localStorage
              </Typography>
            </Box>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          bgcolor: isDark ? alpha('#FFFFFF', 0.02) : alpha('#000000', 0.01),
          borderTop: '1px solid',
          borderColor: 'divider',
          justifyContent: 'space-between',
        }}
      >
        {onStartTour && (
          <Button
            onClick={() => {
              onClose();
              setTimeout(() => onStartTour(), 300);
            }}
            variant="outlined"
            startIcon={<PlayIcon />}
            sx={{
              borderRadius: '8px',
              px: 3,
              py: 1,
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              borderColor: isDark ? alpha('#FFFFFF', 0.2) : alpha('#000000', 0.15),
              color: 'text.primary',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: isDark ? alpha('#3E97FF', 0.1) : alpha('#3E97FF', 0.06),
              },
            }}
          >
            Bắt đầu Tour hướng dẫn
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: '8px',
            px: 4,
            py: 1,
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            boxShadow: 'none',
            background: 'linear-gradient(135deg, #3E97FF 0%, #2884EF 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2884EF 0%, #1B6FD9 100%)',
              boxShadow: '0 4px 12px rgba(62, 151, 255, 0.35)',
            },
            transition: 'all 0.15s ease',
          }}
        >
          Đã hiểu!
        </Button>
      </DialogActions>
    </Dialog>
  );
};
