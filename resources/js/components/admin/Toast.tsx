import { Box, IconButton, Snackbar, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import WarningIcon from '@mui/icons-material/Warning'
import InfoIcon from '@mui/icons-material/Info'
import CloseIcon from '@mui/icons-material/Close'

type ToastProps = {
  open: boolean
  onClose: () => void
  message: string
  severity?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export default function Toast({
  open,
  onClose,
  message,
  severity = 'success',
  duration = 3000
}: ToastProps) {
  const getSeverityConfig = () => {
    switch (severity) {
      case 'success':
        return {
          bgcolor: '#10B981',
          icon: <CheckCircleIcon sx={{ fontSize: 20, color: '#FFFFFF', flexShrink: 0 }} />
        }
      case 'error':
        return {
          bgcolor: '#EF4444',
          icon: <ErrorIcon sx={{ fontSize: 20, color: '#FFFFFF', flexShrink: 0 }} />
        }
      case 'warning':
        return {
          bgcolor: '#F59E0B',
          icon: <WarningIcon sx={{ fontSize: 20, color: '#FFFFFF', flexShrink: 0 }} />
        }
      case 'info':
        return {
          bgcolor: '#3B82F6',
          icon: <InfoIcon sx={{ fontSize: 20, color: '#FFFFFF', flexShrink: 0 }} />
        }
      default:
        return {
          bgcolor: '#10B981',
          icon: <CheckCircleIcon sx={{ fontSize: 20, color: '#FFFFFF', flexShrink: 0 }} />
        }
    }
  }

  const config = getSeverityConfig()

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        bottom: { xs: 16, sm: 24 },
        right: { xs: 16, sm: 24 },
        zIndex: 9999
      }}
    >
      <Box
        sx={{
          bgcolor: config.bgcolor,
          color: '#FFFFFF',
          borderRadius: 2,
          px: 3,
          py: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minWidth: { xs: 280, sm: 320 },
          maxWidth: { xs: 'calc(100vw - 32px)', sm: 400 },
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        {config.icon}
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: '#FFFFFF',
            flex: 1,
            lineHeight: 1.5
          }}
        >
          {message}
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: '#FFFFFF',
            p: 0.5,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Snackbar>
  )
}



