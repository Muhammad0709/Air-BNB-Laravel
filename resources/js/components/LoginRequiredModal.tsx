import React, { useState } from 'react'
import { Box, Button, IconButton, InputAdornment, Modal, TextField, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { router } from '@inertiajs/react'
import { useLanguage } from '../hooks/use-language'

type LoginRequiredModalProps = {
  open: boolean
  onClose: () => void
  loginRedirectUrl?: string
}

export default function LoginRequiredModal({ open, onClose, loginRedirectUrl }: LoginRequiredModalProps) {
  const { t } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)

  const handleContinue = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onClose()
    const redirect = loginRedirectUrl ? `?redirect=${encodeURIComponent(loginRedirectUrl)}` : ''
    router.visit(`/login${redirect}`)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="login-required-title"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
      slotProps={{
        backdrop: {
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.38)' },
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 680,
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          bgcolor: '#FFFFFF',
          borderRadius: { xs: '24px', sm: '40px' },
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          p: { xs: '64px 20px 24px', sm: '76px 40px 24px' },
          position: 'relative',
          outline: 'none',
          textAlign: 'center',
        }}
      >
        <IconButton
          aria-label={t('listing_detail.close')}
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: { xs: 16, sm: 32 },
            right: { xs: 16, sm: 32 },
            zIndex: 2,
            width: 48,
            height: 48,
            bgcolor: 'transparent',
            color: '#222222',
            '&:hover': { bgcolor: '#F7F7F7', color: '#222222' },
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography
          id="login-required-title"
          component="h2"
          sx={{
            fontSize: { xs: 30, sm: 40 },
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            fontWeight: 700,
            color: '#222222',
            mb: { xs: 3, sm: 4 },
          }}
        >
          Log in or sign up
        </Typography>
        <Box component="form" onSubmit={handleContinue} sx={{ width: '100%', maxWidth: 544, mx: 'auto' }}>
          <TextField
            fullWidth
            placeholder="Enter your email"
            type="email"
            variant="outlined"
            autoComplete="email"
            sx={{
              '& .MuiOutlinedInput-root': {
                height: { xs: 54, sm: 60 },
                borderRadius: { xs: '14px', sm: '16px' },
                fontSize: { xs: 16, sm: 18 },
                color: '#222222',
                '& fieldset': { borderColor: '#E6E8EC', borderWidth: 1 },
                '&:hover fieldset': { borderColor: '#D1D5DB' },
                '&.Mui-focused fieldset': { borderColor: '#AD542D' },
              },
              '& .MuiInputBase-input': { px: { xs: 2, sm: 2.5 } },
              '& .MuiInputBase-input::placeholder': { color: '#9AA0A6', opacity: 1 },
            }}
          />
          <TextField
            fullWidth
            placeholder="Enter your password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            autoComplete="current-password"
            sx={{
              mt: { xs: 2, sm: 2.5 },
              '& .MuiOutlinedInput-root': {
                height: { xs: 54, sm: 60 },
                borderRadius: { xs: '14px', sm: '16px' },
                fontSize: { xs: 16, sm: 18 },
                color: '#222222',
                '& fieldset': { borderColor: '#E6E8EC', borderWidth: 1 },
                '&:hover fieldset': { borderColor: '#D1D5DB' },
                '&.Mui-focused fieldset': { borderColor: '#AD542D' },
              },
              '& .MuiInputBase-input': { px: { xs: 2, sm: 2.5 } },
              '& .MuiInputBase-input::placeholder': { color: '#9AA0A6', opacity: 1 },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((current) => !current)}
                    onMouseDown={(event) => event.preventDefault()}
                    edge="end"
                    sx={{ color: '#717171' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{
              mt: { xs: 2, sm: 3 },
              height: { xs: 56, sm: 60 },
              borderRadius: { xs: '16px', sm: '18px' },
              textTransform: 'none',
              fontSize: { xs: 18, sm: 20 },
              fontWeight: 700,
              bgcolor: '#AD542D',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#78381C', boxShadow: 'none' },
            }}
          >
            Continue
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: { xs: 2.5, sm: 3 } }}>
            <Box sx={{ flex: 1, borderTop: '1px solid #DDDDDD' }} />
            <Typography sx={{ fontSize: { xs: 16, sm: 18 }, color: '#222222' }}>or</Typography>
            <Box sx={{ flex: 1, borderTop: '1px solid #DDDDDD' }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 2, sm: 3 } }}>
            <Button
              type="button"
              variant="outlined"
              aria-label="Continue with Google"
              onClick={() => { onClose(); window.location.href = '/auth/google?intent=customer' }}
              sx={{
                width: { xs: 68, sm: 76 },
                height: { xs: 68, sm: 76 },
                minWidth: 0,
                borderRadius: { xs: '16px', sm: '18px' },
                border: '2px solid #DDDDDD',
                '&:hover': { border: '2px solid #AAAAAA', bgcolor: '#FFFFFF' },
              }}
            >
              <Box component="img" src="/images/Social-icon.svg" alt="" sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }} />
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}
