import { useState } from 'react'
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
// import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import Toast from '../../../Components/Admin/Toast'
import { Head, router } from '@inertiajs/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export default function RequestPayout() {
  const [toastOpen, setToastOpen] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    accountNumber: '',
    accountName: '',
    bankName: '',
    routingNumber: '',
    paypalEmail: '',
    notes: ''
  })

  const availableBalance = 8450 // Mock available balance

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // const handleSelectChange = (name: string, value: string) => {
  //   setFormData(prev => ({ ...prev, [name]: value }))
  // }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Payout request data:', formData)
    setToastOpen(true)
    // Navigate back to earnings list after successful submission
    setTimeout(() => {
      router.visit('/host/earnings')
    }, 1500)
  }

  const handleToastClose = () => {
    setToastOpen(false)
  }

  return (
    <>
      <Head title="Request Payout" />
      <HostLayout title="Request Payout">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.visit('/host/earnings')}
        sx={{
          mb: 3,
          color: '#717171',
          textTransform: 'none',
          '&:hover': { bgcolor: '#F9FAFB', color: '#222222' }
        }}
      >
        Back to Earnings
      </Button>

      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222', mb: 4 }}>
            Request Payout
          </Typography>

          {/* Available Balance Info */}
          <Box
            sx={{
              p: 3,
              mb: 4,
              bgcolor: '#F0FDF4',
              border: '1px solid #10B981',
              borderRadius: 2
            }}
          >
            <Typography variant="body2" sx={{ color: '#717171', mb: 1 }}>
              Available Balance
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
              ${availableBalance.toLocaleString()}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Row>
              <Col xs={12} md={6}>
                <Stack spacing={3}>
                  <TextField
                    label="Amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: '#717171' }}>$</Typography>
                    }}
                    helperText={`Maximum: $${availableBalance.toLocaleString()}`}
                  />
                  {/* <FormControl fullWidth required>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={formData.paymentMethod}
                      onChange={(e) => handleSelectChange('paymentMethod', e.target.value)}
                      label="Payment Method"
                    >
                      <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                      <MenuItem value="paypal">PayPal</MenuItem>
                    </Select>
                  </FormControl> */}
                </Stack>
              </Col>
              <Col xs={12} md={6}>
                <Stack spacing={3}>
                  {formData.paymentMethod === 'bank_transfer' && (
                    <>
                      <TextField
                        label="Account Name"
                        name="accountName"
                        value={formData.accountName}
                        onChange={handleChange}
                        required={formData.paymentMethod === 'bank_transfer'}
                        fullWidth
                      />
                      <TextField
                        label="Bank Name"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        required={formData.paymentMethod === 'bank_transfer'}
                        fullWidth
                      />
                      <TextField
                        label="Account Number"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        required={formData.paymentMethod === 'bank_transfer'}
                        fullWidth
                      />
                      <TextField
                        label="Routing Number"
                        name="routingNumber"
                        value={formData.routingNumber}
                        onChange={handleChange}
                        required={formData.paymentMethod === 'bank_transfer'}
                        fullWidth
                      />
                    </>
                  )}
                  {formData.paymentMethod === 'paypal' && (
                    <TextField
                      label="PayPal Email"
                      name="paypalEmail"
                      type="email"
                      value={formData.paypalEmail}
                      onChange={handleChange}
                      required={formData.paymentMethod === 'paypal'}
                      fullWidth
                      placeholder="your.email@example.com"
                    />
                  )}
                </Stack>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col xs={12}>
                <TextField
                  label="Notes (Optional)"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Add any additional notes or instructions..."
                />
              </Col>
            </Row>

            <Row className="mt-4">
              <Col xs={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end" sx={{ width: '100%' }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.visit('/host/earnings')}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#D1D5DD',
                      color: '#717171',
                      '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
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
              </Col>
            </Row>
          </form>
        </CardContent>
      </Card>
      <Toast
        open={toastOpen}
        onClose={handleToastClose}
        message="Payout request submitted successfully!"
        severity="success"
      />
      </HostLayout>
    </>
  )
}

