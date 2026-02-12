import { useState } from 'react'
import { Box, Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, TextField, InputAdornment } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import DeleteConfirmationDialog from '../../../Components/Admin/DeleteConfirmationDialog'
import ActionsMenu from '../../../Components/Admin/ActionsMenu'
import SearchIcon from '@mui/icons-material/Search'
import DownloadIcon from '@mui/icons-material/Download'
import { Head, router } from '@inertiajs/react'

export default function HostEarnings() {
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: number; type: 'earning' | 'payout'; identifier: string } | null>(null)

  const earningsStats = [
    { title: 'Total Earnings', value: '$24,560', color: '#10B981', change: '+22% this month' },
    { title: 'Available Balance', value: '$8,450', color: '#4F46E5', change: 'Ready to withdraw' },
    { title: 'Pending Payouts', value: '$3,200', color: '#F59E0B', change: 'Processing' },
  ]

  const earnings = [
    { id: 1, bookingId: 'BK-001', guest: 'John Doe', property: 'Luxury Beachfront Villa', date: '2025-01-15', amount: '$1,495', status: 'Paid', payoutDate: '2025-01-20' },
    { id: 2, bookingId: 'BK-002', guest: 'Jane Smith', property: 'Modern Apartment', date: '2025-01-18', amount: '$799', status: 'Pending', payoutDate: '-' },
    { id: 3, bookingId: 'BK-003', guest: 'Mike Johnson', property: 'Cozy Studio', date: '2025-01-20', amount: '$625', status: 'Paid', payoutDate: '2025-01-25' },
    { id: 4, bookingId: 'BK-004', guest: 'Sarah Williams', property: 'Luxury Beachfront Villa', date: '2025-01-22', amount: '$1,495', status: 'Paid', payoutDate: '2025-01-27' },
    { id: 5, bookingId: 'BK-005', guest: 'David Brown', property: 'Modern Apartment', date: '2025-01-25', amount: '$899', status: 'Pending', payoutDate: '-' },
  ]

  const payouts = [
    { id: 1, payoutId: 'PO-001', amount: '$5,200', date: '2025-01-20', method: 'Bank Transfer', status: 'Completed', account: '****1234' },
    { id: 2, payoutId: 'PO-002', amount: '$3,100', date: '2025-01-15', method: 'PayPal', status: 'Completed', account: 'host@example.com' },
    { id: 3, payoutId: 'PO-003', amount: '$2,800', date: '2025-01-10', method: 'Bank Transfer', status: 'Completed', account: '****1234' },
    { id: 4, payoutId: 'PO-004', amount: '$4,500', date: '2025-01-05', method: 'PayPal', status: 'Completed', account: 'host@example.com' },
  ]

  const filteredEarnings = earnings.filter(earning =>
    earning.bookingId.toLowerCase().includes(search.toLowerCase()) ||
    earning.guest.toLowerCase().includes(search.toLowerCase()) ||
    earning.property.toLowerCase().includes(search.toLowerCase())
  )

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
    // Prepare CSV data
    const headers = ['Booking ID', 'Guest', 'Property', 'Date', 'Amount', 'Status', 'Payout Date']
    const csvData = filteredEarnings.map(earning => [
      earning.bookingId,
      earning.guest,
      earning.property,
      earning.date,
      earning.amount,
      earning.status,
      earning.payoutDate
    ])

    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `earnings-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDeleteClick = (item: { id: number; type: 'earning' | 'payout'; identifier: string }) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      // Handle delete logic here
      console.log(`Deleting ${itemToDelete.type}:`, itemToDelete.id)
      // In real app: API call to delete earning/payout
      // After successful delete, update the list
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  return (
    <>
      <Head title="Earnings / Payouts" />
      <HostLayout title="Earnings / Payouts">
      {/* Stats Cards */}
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

      {/* Earnings Table */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222' }}>
                  Earnings History
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  <TextField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search earnings..."
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
                    Export
                  </Button>
                </Stack>
              </Stack>

              <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                <Table sx={{ minWidth: 800, width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Booking ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Guest</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Property</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Payout Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEarnings.map((earning) => (
                      <TableRow key={earning.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                        <TableCell sx={{ fontWeight: 600, color: '#222222' }}>{earning.bookingId}</TableCell>
                        <TableCell>{earning.guest}</TableCell>
                        <TableCell>{earning.property}</TableCell>
                        <TableCell sx={{ color: '#717171' }}>{earning.date}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>{earning.amount}</TableCell>
                        <TableCell>
                          <Chip
                            label={earning.status}
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
                            onDelete={() => handleDeleteClick({ id: earning.id, type: 'earning', identifier: earning.bookingId })}
                            viewLabel="View"
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

      {/* Payouts Table */}
      <Row>
        <Col xs={12}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222' }}>
                  Payout History
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.visit('/host/earnings/request-payout')}
                  fullWidth={window.innerWidth < 600}
                  sx={{
                    bgcolor: '#AD542D',
                    textTransform: 'none',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#78381C' }
                  }}
                >
                  Request Payout
                </Button>
              </Stack>

              <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                <Table sx={{ minWidth: 700, width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Payout ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Method</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Account</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#222222', whiteSpace: 'nowrap' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                        <TableCell sx={{ fontWeight: 600, color: '#222222' }}>{payout.payoutId}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#222222' }}>{payout.amount}</TableCell>
                        <TableCell sx={{ color: '#717171' }}>{payout.date}</TableCell>
                        <TableCell sx={{ color: '#717171' }}>{payout.method}</TableCell>
                        <TableCell sx={{ color: '#717171' }}>{payout.account}</TableCell>
                        <TableCell>
                          <Chip
                            label={payout.status}
                            size="small"
                            sx={{
                              bgcolor: `${getStatusColor(payout.status)}15`,
                              color: getStatusColor(payout.status),
                              fontWeight: 600,
                              fontSize: 12
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <ActionsMenu
                            onView={() => router.visit(`/host/earnings/payout/${payout.id}`)}
                            onDelete={() => handleDeleteClick({ id: payout.id, type: 'payout', identifier: payout.payoutId })}
                            viewLabel="View"
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={itemToDelete?.type === 'earning' 
          ? `Are you sure you want to delete this earning?` 
          : `Are you sure you want to delete this payout?`}
        itemName={itemToDelete ? (itemToDelete.type === 'earning' ? `earning ${itemToDelete.identifier}` : `payout ${itemToDelete.identifier}`) : 'this item'}
      />
      </HostLayout>
    </>
  )
}

