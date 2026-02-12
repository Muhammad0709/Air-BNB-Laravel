import React, { useState } from 'react'
import { Avatar, Box, Button, Divider, Menu, MenuItem, Stack, Typography } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HotelIcon from '@mui/icons-material/Hotel'
import BookOnlineIcon from '@mui/icons-material/BookOnline'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import MessageIcon from '@mui/icons-material/Message'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import { router, usePage } from '@inertiajs/react'
import { useLanguage } from '../../hooks/use-language'

type HostSidebarProps = {
  sidebarOpen: boolean
}

export default function HostSidebar({ sidebarOpen }: HostSidebarProps) {
  const { isRtl } = useLanguage()
  const { auth } = usePage().props as any
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  const user = auth?.user
  const hostUser = {
    name: user?.name || 'Host User',
    email: user?.email || 'host@example.com',
    profile_picture: user?.profile_picture ?? null,
    initials: user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'H'
  }
  const displayEmail = hostUser.email.length > 21 ? hostUser.email.slice(0, 21) + '...' : hostUser.email

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleSettingsClick = () => {
    router.visit('/host/settings/profile')
    handleMenuClose()
  }

  const handleLogoutClick = () => {
    router.post('/host/logout')
    handleMenuClose()
  }

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
              bgcolor: menuOpen ? '#FFF5F5' : 'transparent',
              '&:hover': {
                bgcolor: menuOpen ? '#FFF5F5' : '#F9FAFB'
              }
            }}
          >
            <Stack direction="row" spacing={2} useFlexGap alignItems="center" sx={{ width: '100%' }}>
              <Avatar
                src={hostUser.profile_picture ?? undefined}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#AD542D',
                  fontSize: '0.875rem',
                  fontWeight: 700
                }}
              >
                {hostUser.initials}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0, textAlign: isRtl ? 'right' : 'left' }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#222222',
                    lineHeight: 1.2
                  }}
                >
                  {hostUser.name}
                </Typography>
                <Typography
                  title={hostUser.email}
                  sx={{
                    fontSize: 12,
                    color: '#717171',
                    lineHeight: 1.2,
                    mt: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {displayEmail}
                </Typography>
              </Box>
              <KeyboardArrowDownIcon
                sx={{
                  fontSize: 20,
                  color: '#717171',
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
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            '& .MuiList-root': {
              paddingTop: '2px',
              paddingBottom: '2px'
            }
          }
        }}
      >
        {/* User Info Section */}
        <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={hostUser.profile_picture ?? undefined}
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#AD542D',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#FFFFFF'
              }}
            >
              {hostUser.initials}
            </Avatar>
            <Box>
              <Typography
                component="span"
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#222222',
                  lineHeight: 1.2,
                  display: 'block'
                }}
              >
                {hostUser.name}
              </Typography>
              <Typography
                component="span"
                title={hostUser.email}
                sx={{
                  fontSize: 12,
                  color: '#717171',
                  lineHeight: 1.2,
                  mt: 0.5,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {displayEmail}
              </Typography>
            </Box>
          </Stack>
        </Box>

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
            <SettingsIcon sx={{ fontSize: 18, color: '#717171', marginInlineEnd: 1.5 }} />
            <Typography sx={{ fontSize: 14, color: '#222222', fontWeight: 500 }}>
              Settings
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
            <LogoutIcon sx={{ fontSize: 18, color: '#717171', marginInlineEnd: 1.5 }} />
            <Typography sx={{ fontSize: 14, color: '#222222', fontWeight: 500 }}>
              Log out
            </Typography>
          </MenuItem>
        </Box>
      </Menu>
    </>
  )
}
