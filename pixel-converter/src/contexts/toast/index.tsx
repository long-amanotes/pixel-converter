import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

type ToastPayload = {
  message: string;
  severity?: ToastSeverity;
  autoHideDurationMs?: number;
};

type ToastContextValue = {
  notify: (payload: ToastPayload) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<ToastSeverity>('info');
  const [autoHideDurationMs, setAutoHideDurationMs] = useState<number>(3500);

  const notify = useCallback(({ message, severity, autoHideDurationMs }: ToastPayload) => {
    setMessage(message);
    setSeverity(severity ?? 'info');
    setAutoHideDurationMs(autoHideDurationMs ?? 3500);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={autoHideDurationMs}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={severity}
          variant="filled"
          onClose={() => setOpen(false)}
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

