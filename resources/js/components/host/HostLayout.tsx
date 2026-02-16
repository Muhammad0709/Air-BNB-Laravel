import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Box, IconButton, Menu, MenuItem, Paper, Stack, Typography } from '@mui/material'
import { Container as RBContainer } from 'react-bootstrap'
import MenuIcon from '@mui/icons-material/Menu'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import HostSidebar from './HostSidebar'
import { useLanguage } from '../../hooks/use-language'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'ku', name: 'Kurdish', flag: '🇮🇶' },
]

type HostLayoutProps = {
  title: string
  children: ReactNode
}

export default function HostLayout({ title, children }: HostLayoutProps) {
  const { isRtl, language, switchLanguage } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(null)
  const currentLanguage = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

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
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <Box
          onClick={() => setSidebarOpen(false)}
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1200
          }}
        />
      )}

      {/* Sidebar */}
      <HostSidebar sidebarOpen={sidebarOpen} />

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
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222' }}>
                  {title}
                </Typography>
              </Stack>
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
