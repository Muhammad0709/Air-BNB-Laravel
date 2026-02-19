import React from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HotelIcon from '@mui/icons-material/Hotel'
import BookOnlineIcon from '@mui/icons-material/BookOnline'
import MessageIcon from '@mui/icons-material/Message'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import { router } from '@inertiajs/react'
import { useLanguage } from '../../hooks/use-language'

type HostSidebarProps = {
  sidebarOpen: boolean
}

export default function HostSidebar({ sidebarOpen }: HostSidebarProps) {
  const { isRtl } = useLanguage()
  const isActive = (path: string) => {
    if (path === '/host/dashboard') {
      return window.location.pathname === '/host/dashboard'
    }
    return window.location.pathname.startsWith(path)
  }

  const menuItems = [
    {
      label: 'Dashboard',
      icon: DashboardIcon,
      path: '/host/dashboard',
      onClick: () => router.visit('/host/dashboard')
    },
    {
      label: 'Manage Properties',
      icon: HotelIcon,
      path: '/host/properties',
      onClick: () => router.visit('/host/properties')
    },
    {
      label: 'Bookings',
      icon: BookOnlineIcon,
      path: '/host/bookings',
      onClick: () => router.visit('/host/bookings')
    },
    {
      label: 'Earnings / Payouts',
      icon: AccountBalanceWalletIcon,
      path: '/host/earnings',
      onClick: () => router.visit('/host/earnings')
    },
    {
      label: 'Messages',
      icon: MessageIcon,
      path: '/host/chat',
      onClick: () => router.visit('/host/chat')
    },
  ]

  return (
    <>
      <Box
        sx={{
          position: { xs: 'fixed', md: 'fixed' },
          top: 0,
          ...(isRtl ? { right: 0 } : { left: 0 }),
          width: { xs: sidebarOpen ? 280 : 0, md: sidebarOpen ? 280 : 0 },
          bgcolor: '#FFFFFF',
          ...(isRtl ? { borderLeft: '1px solid #E5E7EB' } : { borderRight: '1px solid #E5E7EB' }),
          transition: 'width 0.3s',
          overflow: 'hidden',
          display: { xs: sidebarOpen ? 'flex' : 'none', md: 'flex' },
          flexDirection: 'column',
          height: '100vh',
          zIndex: { xs: 1300, md: 1000 }
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #E5E7EB' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#222222' }}>
            Host Panel
          </Typography>
        </Box>
        <Stack spacing={1} sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon
            return (
              <Button
                key={item.path}
                fullWidth
                startIcon={<Icon />}
                onClick={item.onClick}
                sx={{
                  justifyContent: 'flex-start',
                  bgcolor: active ? '#FFF5F5' : 'transparent',
                  color: active ? '#AD542D' : '#717171',
                  fontWeight: active ? 700 : 600,
                  textTransform: 'none',
                  gap: 1.5,
                  '& .MuiButton-startIcon': {
                    marginInlineEnd: 1.5,
                    marginInlineStart: 0
                  },
                  '&:hover': {
                    bgcolor: active ? '#FFF5F5' : '#F9FAFB'
                  }
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </Stack>
      </Box>
    </>
  )
}
