
import React, { createContext, useContext, useState, useCallback } from 'react';
import AlertDialog from '../components/AlertDialog';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    severity: 'info' // 'info', 'success', 'error'
  });

  const showAlert = useCallback((message, title = '', severity = 'info') => {
    // If user passes just a string as first arg, handle it.
    // If title is missing, we can infer from severity or leave blank.
    setAlertConfig({
      title: title,
      message: message,
      severity: severity
    });
    setOpen(true);
  }, []);

  const hideAlert = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AlertDialog
        open={open}
        title={alertConfig.title}
        message={alertConfig.message}
        severity={alertConfig.severity}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
