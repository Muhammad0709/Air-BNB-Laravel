import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Avatar, Box, Divider, IconButton, Menu, MenuItem, Paper, Stack, Typography } from '@mui/material'
import { Container as RBContainer } from 'react-bootstrap'
import MenuIcon from '@mui/icons-material/Menu'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import AdminSidebar from './AdminSidebar'
import { useLanguage } from '../../hooks/use-language'
import { usePage, router } from '@inertiajs/react'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'ku', name: 'Kurdish', flag: '🇮🇶' },
]

type AdminLayoutProps = {
  title: string
  children: ReactNode
}

export default function AdminLayout({ title, children }: AdminLayoutProps) {
  const { isRtl, language, switchLanguage } = useLanguage()
  const { auth } = usePage().props as { auth?: { user?: { name?: string; email?: string; profile_picture?: string | null } } }
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(null)
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null)
  const currentLanguage = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]
  const user = auth?.user
  const adminUser = {
    profile_picture: user?.profile_picture ?? null,
    initials: user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'AU'
  }

  const handleSettingsClick = () => {
    router.visit('/admin/settings/profile')
    setProfileAnchor(null)
  }
  const handleLogoutClick = () => {
    router.post('/admin/logout')
    setProfileAnchor(null)
  }

  // Auto-show sidebar on desktop, hide on mobile
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 960)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      {/* Mobile backdrop - tap to close sidebar */}
      <Box
        onClick={() => setSidebarOpen(false)}
        sx={{
          display: { xs: sidebarOpen ? 'block' : 'none', md: 'none' },
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0,0,0,0.4)',
          zIndex: 999,
          transition: 'opacity 0.2s',
        }}
      />
      {/* Sidebar - onNavigate closes sidebar on mobile after link click */}
      <AdminSidebar sidebarOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        ...(isRtl
          ? { marginRight: { xs: 0, md: sidebarOpen ? '280px' : 0 }, transition: 'margin-right 0.3s' }
          : { marginLeft: { xs: 0, md: sidebarOpen ? '280px' : 0 }, transition: 'margin-left 0.3s' }),
        width: { xs: '100%', md: sidebarOpen ? 'calc(100% - 280px)' : '100%' },
        overflowX: 'hidden'
      }}>
        {/* Header */}
        <Paper elevation={0} sx={{ borderBottom: '1px solid #E5E7EB', bgcolor: '#FFFFFF' }}>
          <RBContainer fluid>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2} useFlexGap>
                <IconButton
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  sx={{ display: 'flex' }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', display: { xs: 'none', md: 'block' } }}>
                  {title}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                <Box
                  onClick={(e: React.MouseEvent<HTMLElement>) => setLanguageAnchor(e.currentTarget)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.75, borderRadius: 2,
                    border: '1px solid #DDDDDD', cursor: 'pointer', bgcolor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    '&:hover': { borderColor: '#AD542D', bgcolor: '#F7F7F7' },
                  }}
                >
                  <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>{currentLanguage.flag}</Typography>
                  <Typography sx={{ color: '#222222', fontWeight: 600, fontSize: '0.875rem', marginInlineStart: 0.75 }}>{currentLanguage.code.toUpperCase()}</Typography>
                  <ArrowDropDownIcon sx={{ fontSize: 22, color: '#222222' }} />
                </Box>
                <Box
                  onClick={(e: React.MouseEvent<HTMLElement>) => setProfileAnchor(e.currentTarget)}
                  sx={{
                    display: 'flex', alignItems: 'center', cursor: 'pointer',
                  }}
                >
                  <Avatar
                    src={adminUser.profile_picture ?? undefined}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: '#AD542D',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      ...(adminUser.profile_picture ? {} : { border: '2px solid rgba(173, 84, 45, 0.2)' }),
                      boxSizing: 'border-box',
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    {adminUser.initials}
                  </Avatar>
                </Box>
              </Stack>
              <Menu
                anchorEl={languageAnchor}
                open={Boolean(languageAnchor)}
                onClose={() => setLanguageAnchor(null)}
                PaperProps={{ sx: { mt: 1.5, minWidth: 180, borderRadius: 2, boxShadow: '0 2px 16px rgba(0,0,0,0.12)' } }}
                transformOrigin={{ horizontal: isRtl ? 'left' : 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: isRtl ? 'left' : 'right', vertical: 'bottom' }}
              >
                {LANGUAGES.map((lang) => (
                  <MenuItem
                    key={lang.code}
                    onClick={() => { switchLanguage(lang.code as any); setLanguageAnchor(null); }}
                    sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: '#F7F7F7' } }}
                  >
                    <Stack direction="row" spacing={1.5} useFlexGap alignItems="center">
                      <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>{lang.flag}</Typography>
                      <Typography sx={{ fontWeight: 400, fontSize: '0.875rem', color: '#222222' }}>{lang.name}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Menu>
              <Menu
                anchorEl={profileAnchor}
                open={Boolean(profileAnchor)}
                onClose={() => setProfileAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: isRtl ? 'left' : 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: isRtl ? 'left' : 'right' }}
                PaperProps={{
                  sx: { mt: 1.5, width: 'max-content', minWidth: 140, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB' }
                }}
              >
                <Box sx={{ py: 1 }}>
                  <MenuItem onClick={handleSettingsClick} sx={{ py: 1.5, px: 2, mx: 1, borderRadius: 1, '&:hover': { bgcolor: '#F9FAFB' } }}>
                    <SettingsIcon sx={{ fontSize: 18, color: '#6B7280', marginInlineEnd: 1.5 }} />
                    <Typography sx={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>Settings</Typography>
                  </MenuItem>
                  <Divider sx={{ mx: 1, borderColor: '#E5E7EB' }} />
                  <MenuItem onClick={handleLogoutClick} sx={{ py: 1.5, px: 2, mx: 1, borderRadius: 1, '&:hover': { bgcolor: '#F9FAFB' } }}>
                    <LogoutIcon sx={{ fontSize: 18, color: '#6B7280', marginInlineEnd: 1.5 }} />
                    <Typography sx={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>Log out</Typography>
                  </MenuItem>
                </Box>
              </Menu>
            </Stack>
          </RBContainer>
        </Paper>

        {/* Page Content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          <RBContainer fluid>
            {children}
          </RBContainer>
        </Box>
      </Box>
    </Box>
  )
}



