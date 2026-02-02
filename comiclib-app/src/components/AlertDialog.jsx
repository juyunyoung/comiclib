
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography, keyframes } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const AlertDialog = ({ open, title, message, onClose, severity = 'info' }) => {

  const getIcon = () => {
    switch (severity) {
      case 'success': return <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />;
      case 'error': return <ErrorIcon color="error" sx={{ fontSize: 40, mb: 1 }} />;
      case 'info':
      default: return <InfoIcon color="info" sx={{ fontSize: 40, mb: 1 }} />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
          minWidth: 300,
          animation: `${fadeIn} 0.3s ease-out`
        }
      }}
    >
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pb: 1 }}>
        {getIcon()}
        {title && (
          <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
            {title}
          </Typography>
        )}
        <DialogContentText sx={{ color: 'text.primary', mt: 1 }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{ borderRadius: 20, px: 4, textTransform: 'none' }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialog;
