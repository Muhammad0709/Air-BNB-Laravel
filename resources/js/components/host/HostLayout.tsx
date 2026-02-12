import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Box, Button, IconButton, Paper, Stack, Typography } from '@mui/material'
import { Container as RBContainer } from 'react-bootstrap'
import MenuIcon from '@mui/icons-material/Menu'
import HostSidebar from './HostSidebar'
import { useLanguage } from '../../hooks/use-language'

type HostLayoutProps = {
  title: string
  children: ReactNode
}

export default function HostLayout({ title, children }: HostLayoutProps) {
  const { isRtl } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
