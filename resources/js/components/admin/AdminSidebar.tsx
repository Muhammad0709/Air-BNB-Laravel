import React, { useState } from 'react'
import { Avatar, Box, Button, Divider, Menu, MenuItem, Stack, Typography } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import HotelIcon from '@mui/icons-material/Hotel'
import BookOnlineIcon from '@mui/icons-material/BookOnline'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { router, usePage } from '@inertiajs/react'
import { useLanguage } from '../../hooks/use-language'

type AdminSidebarProps = {
  sidebarOpen: boolean
}

export default function AdminSidebar({ sidebarOpen }: AdminSidebarProps) {
  const { isRtl, t } = useLanguage()
  const { url } = usePage()
  const pathname = url
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  const user = (usePage().props as any)?.auth?.user
  const adminUser = {
    name: user?.name || 'Admin',
    email: user?.email || 'admin@admin.com',
    profile_picture: user?.profile_picture ?? null,
    initials: user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'AU'
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleSettingsClick = () => {
    router.visit('/admin/settings/profile')
    handleMenuClose()
  }

  const handleLogoutClick = () => {
    router.post('/admin/logout')
    handleMenuClose()
  }

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return pathname === '/admin/dashboard'
    }
    return pathname.startsWith(path)
  }

  const menuItems = [
    { labelKey: 'admin.sidebar.dashboard', icon: DashboardIcon, path: '/admin/dashboard', onClick: () => router.visit('/admin/dashboard') },
    { labelKey: 'admin.sidebar.users', icon: PeopleIcon, path: '/admin/users', onClick: () => router.visit('/admin/users') },
    { labelKey: 'admin.sidebar.properties', icon: HotelIcon, path: '/admin/properties', onClick: () => router.visit('/admin/properties') },
    { labelKey: 'admin.sidebar.bookings', icon: BookOnlineIcon, path: '/admin/bookings', onClick: () => router.visit('/admin/bookings') },
    { labelKey: 'admin.sidebar.support_tickets', icon: SupportAgentIcon, path: '/admin/support-tickets', onClick: () => router.visit('/admin/support-tickets') },
    { labelKey: 'admin.sidebar.system_settings', icon: SettingsIcon, path: '/admin/settings', onClick: () => router.visit('/admin/settings') },
  ]

  return (
    <>
      <Box
        sx={{
          position: { xs: 'fixed', md: 'fixed' },
          top: 0,
          ...(isRtl ? { right: 0 } : { left: 0 }),
          width: sidebarOpen ? { xs: 0, md: 280 } : 0,
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

        {/* User Profile Section */}
        <Box
          sx={{
            borderTop: '1px solid #E5E7EB',
            p: 2,
            bgcolor: '#FFFFFF',
            flexShrink: 0,
            mt: 'auto'
          }}
        >
          <Button
            fullWidth
            onClick={handleMenuClick}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              p: 1.5,
              borderRadius: 1,
              bgcolor: menuOpen ? '#FFF2EE' : 'transparent',
              '&:hover': {
                bgcolor: menuOpen ? '#FFF2EE' : '#F9FAFB'
              }
            }}
          >
            <Stack direction="row" spacing={2} useFlexGap alignItems="center" sx={{ width: '100%' }}>
              <Avatar
                src={adminUser.profile_picture ?? undefined}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#AD542D',
                  fontSize: '0.875rem',
                  fontWeight: 700
                }}
              >
                {adminUser.initials}
              </Avatar>
              <Box sx={{ flex: 1, textAlign: isRtl ? 'right' : 'left' }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#111827',
                    lineHeight: 1.2
                  }}
                >
                  {adminUser.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: '#6B7280',
                    lineHeight: 1.2,
                    mt: 0.5
                  }}
                >
                  {adminUser.email}
                </Typography>
              </Box>
              <KeyboardArrowDownIcon
                sx={{
                  fontSize: 20,
                  color: '#6B7280',
                  transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              />
            </Stack>
          </Button>
        </Box>
      </Box>

      {/* User Menu Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 240,
            borderRadius: 1,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB',
            overflow: 'hidden'
          }
        }}
      >
        {/* User Info Section */}
        <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={adminUser.profile_picture ?? undefined}
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#AD542D',
                fontSize: '0.875rem',
                fontWeight: 700
              }}
            >
              {adminUser.initials}
            </Avatar>
            <Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#111827',
                  lineHeight: 1.2
                }}
              >
                {adminUser.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  color: '#6B7280',
                  lineHeight: 1.2,
                  mt: 0.5
                }}
              >
                {adminUser.email}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Menu Items */}
        <Box sx={{ py: 1 }}>
          <MenuItem
            onClick={handleSettingsClick}
            sx={{
              py: 1.5,
              px: 2,
              mx: 1,
              borderRadius: 1,
              '&:hover': { bgcolor: '#F9FAFB' }
            }}
          >
            <SettingsIcon sx={{ fontSize: 18, color: '#6B7280', marginInlineEnd: 1.5 }} />
            <Typography sx={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>
              {t('admin.sidebar.settings')}
            </Typography>
          </MenuItem>
          <Box sx={{ px: 1, py: 0.5 }}>
            <Divider 
              sx={{ 
                borderColor: '#E5E7EB',
                borderWidth: '1px',
                borderStyle: 'solid'
              }} 
            />
          </Box>
          <MenuItem
            onClick={handleLogoutClick}
            sx={{
              py: 1.5,
              px: 2,
              mx: 1,
              borderRadius: 1,
              '&:hover': { bgcolor: '#F9FAFB' }
            }}
          >
            <LogoutIcon sx={{ fontSize: 18, color: '#6B7280', marginInlineEnd: 1.5 }} />
            <Typography sx={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>
              {t('admin.sidebar.log_out')}
            </Typography>
          </MenuItem>
        </Box>
      </Menu>
    </>
  )
}



