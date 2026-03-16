import { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, TextField, InputAdornment } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import ActionsMenu from '../../../Components/Admin/ActionsMenu'
import SearchIcon from '@mui/icons-material/Search'
import DownloadIcon from '@mui/icons-material/Download'
import { Head, router, usePage } from '@inertiajs/react'
import { useLanguage } from '../../../hooks/use-language'

interface Earning {
  id: number
  bookingId: string
  guest: string
  property: string
  date: string
  amount: string
  status: string
  payoutDate: string
}

interface Props {
  earnings: Earning[]
  totalEarnings: string
  availableBalance: string
}

export default function HostEarnings() {
  const { t } = useLanguage()
  const { earnings, totalEarnings, availableBalance } = usePage<Props>().props
  const [search, setSearch] = useState('')

  const earningsStats = [
    { title: t('host.earnings.total_earnings'), value: totalEarnings, color: '#10B981', change: t('host.earnings.change_this_month') },
    { title: t('host.earnings.available_balance'), value: availableBalance, color: '#4F46E5', change: t('host.earnings.ready_to_withdraw') },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/host/earnings', search.trim() ? { search } : {}, { 
        preserveState: true, 
        preserveScroll: true, 
        only: ['earnings'] 
      })
    }, 200)
    return () => clearTimeout(timer)
  }, [search])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
      case 'Completed': return '#10B981'
      case 'Pending':
      case 'Processing': return '#F59E0B'
      case 'Cancelled': return '#EF4444'
      default: return '#717171'
    }
  }

  const handleExport = () => {
    const headers = [t('host.earnings.booking_id'), t('host.earnings.guest'), t('host.earnings.property'), t('host.earnings.date'), t('host.earnings.amount'), t('host.earnings.status'), t('host.earnings.payout_date')]
    const csvData = earnings.map(earning => [
      earning.bookingId,
      earning.guest,
      earning.property,
      earning.date,
      earning.amount,
      earning.status,
      earning.payoutDate
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const downloadLink = document.createElement('a')
    const blobUrl = URL.createObjectURL(csvBlob)
    downloadLink.setAttribute('href', blobUrl)
    downloadLink.setAttribute('download', `earnings-${new Date().toISOString().split('T')[0]}.csv`)
    downloadLink.style.visibility = 'hidden'
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  const statusLabel = (status: string) => {
    if (status === 'Paid') return t('host.earnings.paid')
    if (status === 'Pending') return t('host.earnings.pending')
    if (status === 'Completed') return t('host.earnings.completed')
    return status
  }

  return (
    <>
      <Head title={t('host.earnings.title')} />
      <HostLayout title={t('host.earnings.title')}>
      <Row className="g-3 mb-4">
        {earningsStats.map((stat, idx) => (
          <Col key={idx} xs={12} sm={6} lg={4}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: `${stat.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography sx={{ color: stat.color, fontSize: 24, fontWeight: 700 }}>$</Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: stat.color,
                      fontWeight: 600,
                      bgcolor: `${stat.color}15`,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: 11
                    }}
                  >
                    {stat.change}
                  </Typography>
                </Stack>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#222222', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#717171' }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mb-4">
        <Col xs={12}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222' }}>
                  {t('host.earnings.earnings_history')}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  <TextField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('host.earnings.search_placeholder')}
                    size="small"
                    sx={{ width: { xs: '100%', sm: 250 } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                    fullWidth={window.innerWidth < 600}
                    sx={{
                      borderColor: '#D0D5DD',
                      color: '#344054',
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': { borderColor: '#D0D5DD', bgcolor: '#F9FAFB' }
                    }}
                  >
                    {t('host.earnings.export')}
                  </Button>
                </Stack>
              </Stack>

              <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                <Table sx={{ minWidth: 800, width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('host.earnings.booking_id')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('host.earnings.guest')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('host.earnings.property')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('host.earnings.date')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('host.earnings.amount')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('host.earnings.status')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('host.earnings.payout_date')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{t('host.earnings.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {earnings.map((earning) => (
                      <TableRow key={earning.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                        <TableCell sx={{ fontWeight: 600, color: '#222222' }}>{earning.bookingId}</TableCell>
                        <TableCell>{earning.guest}</TableCell>
                        <TableCell>{earning.property}</TableCell>
                        <TableCell sx={{ color: '#717171' }}>{earning.date}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{earning.amount}</TableCell>
                        <TableCell>
                          <Chip
                            label={statusLabel(earning.status)}
                            size="small"
                            sx={{
                              bgcolor: `${getStatusColor(earning.status)}15`,
                              color: getStatusColor(earning.status),
                              fontWeight: 600,
                              fontSize: 12
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#717171' }}>{earning.payoutDate}</TableCell>
                        <TableCell>
                          <ActionsMenu
                            onView={() => router.visit(`/host/earnings/show/${earning.id}`)}
                            viewLabel={t('host.earnings.view')}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Col>
      </Row>
      </HostLayout>
    </>
  )
}
