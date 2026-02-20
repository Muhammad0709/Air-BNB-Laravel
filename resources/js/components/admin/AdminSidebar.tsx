import React from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import HotelIcon from '@mui/icons-material/Hotel'
import BookOnlineIcon from '@mui/icons-material/BookOnline'
import HistoryIcon from '@mui/icons-material/History'
// import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import SettingsIcon from '@mui/icons-material/Settings'
import { router, usePage } from '@inertiajs/react'
import { useLanguage } from '../../hooks/use-language'

type AdminSidebarProps = {
  sidebarOpen: boolean
  onNavigate?: () => void
}

export default function AdminSidebar({ sidebarOpen, onNavigate }: AdminSidebarProps) {
  const { t, isRtl } = useLanguage()
  const { url } = usePage()
  const pathname = url

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return pathname === '/admin/dashboard'
    }
    return pathname.startsWith(path)
  }

  const handleNav = (path: string) => {
    router.visit(path, { onFinish: () => onNavigate?.() })
  }

  const menuItems = [
    { labelKey: 'admin.sidebar.dashboard', icon: DashboardIcon, path: '/admin/dashboard', onClick: () => handleNav('/admin/dashboard') },
    { labelKey: 'admin.sidebar.users', icon: PeopleIcon, path: '/admin/users', onClick: () => handleNav('/admin/users') },
    { labelKey: 'admin.sidebar.properties', icon: HotelIcon, path: '/admin/properties', onClick: () => handleNav('/admin/properties') },
    { labelKey: 'admin.sidebar.bookings', icon: BookOnlineIcon, path: '/admin/bookings', onClick: () => handleNav('/admin/bookings') },
    { labelKey: 'admin.sidebar.history', icon: HistoryIcon, path: '/admin/history', onClick: () => handleNav('/admin/history') },
    // { labelKey: 'admin.sidebar.support_tickets', icon: SupportAgentIcon, path: '/admin/support-tickets', onClick: () => handleNav('/admin/support-tickets') },
    { labelKey: 'admin.sidebar.system_settings', icon: SettingsIcon, path: '/admin/settings', onClick: () => handleNav('/admin/settings') },
  ]

  return (
    <>
      <Box
        sx={{
          position: { xs: 'fixed', md: 'fixed' },
          top: 0,
          ...(isRtl ? { right: 0 } : { left: 0 }),
          width: sidebarOpen ? 280 : 0,
          bgcolor: '#FFFFFF',
          ...(isRtl ? { borderLeft: '1px solid #E5E7EB' } : { borderRight: '1px solid #E5E7EB' }),
          transition: 'width 0.3s',
          overflow: 'hidden',
          display: { xs: sidebarOpen ? 'flex' : 'none', md: 'flex' },
          flexDirection: 'column',
          height: '100vh',
          zIndex: 1000
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #E5E7EB' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827' }}>
            {t('admin.sidebar.panel')}
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
                  bgcolor: active ? '#FFF2EE' : 'transparent',
                  color: active ? '#AD542D' : '#717171',
                  fontWeight: active ? 700 : 600,
                  textTransform: 'none',
                  gap: 1.5,
                  '& .MuiButton-startIcon': {
                    marginInlineEnd: 1.5,
                    marginInlineStart: 0
                  },
                  '&:hover': {
                    bgcolor: active ? '#FFF2EE' : '#F9FAFB'
                  }
                }}
              >
                {t(item.labelKey)}
              </Button>
            )
          })}
        </Stack>
      </Box>
    </>
  )
}



