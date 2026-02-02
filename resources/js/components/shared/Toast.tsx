import React from 'react'
import { Alert, Snackbar } from '@mui/material'

interface ToastProps {
  open: boolean
  onClose: () => void
  message: string
  severity: 'success' | 'error' | 'warning' | 'info'
}

export default function Toast({ open, onClose, message, severity }: ToastProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  )
}
