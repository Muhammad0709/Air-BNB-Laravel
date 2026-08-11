import { Box, Button, Card, CardContent, Chip, Divider, FormControl, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import HostLayout from '../../../Components/Host/HostLayout'
import { Head, router, usePage } from '@inertiajs/react'
import { useLanguage } from '../../../hooks/use-language'
import RtlBackArrowIcon from '../../../components/RtlBackArrowIcon'
import { adminButtonStartIconSx } from '../../../utils/adminButtonStartIconSx'
import EditIcon from '@mui/icons-material/Edit'
import PersonIcon from '@mui/icons-material/Person'
import HotelIcon from '@mui/icons-material/Hotel'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import StarIcon from '@mui/icons-material/Star'
import { useState } from 'react'
import { getBookingStatusColor, getBookingStatusLabel, getPaymentStatusColor, getPaymentStatusLabel, HOST_SELECTABLE_STATUSES } from '../../../utils/bookingStatus'
import Toast from '../../../components/shared/Toast'

export default function ShowBooking() {
  const { t } = useLanguage()
  const { booking, canReviewGuest, guestReview, canManageDeposit } = usePage().props as {
    booking: {
      id: string
      reference: string
      guest: string
      guestEmail: string
      guestPhone: string
      property: string
      propertyLocation: string
      checkin: string
      checkout: string
      status: string
      paymentStatus: string
      amount: string
      nights: number
      createdAt: string
      depositAmount: number
      depositStatus: string | null
      depositDisputeReason: string | null
    }
    canReviewGuest: boolean
    guestReview: { rating: number; comment: string | null; createdAt: string } | null
    canManageDeposit: boolean
  }
  const id = booking?.id ?? ''

  const [currentStatus, setCurrentStatus] = useState(booking.status)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({})
  const [submittedReview, setSubmittedReview] = useState(guestReview)
  const [depositStatus, setDepositStatus] = useState(booking.depositStatus)
  const [depositDisputeReason, setDepositDisputeReason] = useState(booking.depositDisputeReason)
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [disputeReasonInput, setDisputeReasonInput] = useState('')
  const [depositSubmitting, setDepositSubmitting] = useState(false)
  const [depositErrors, setDepositErrors] = useState<Record<string, string>>({})

  const handleMarkDepositReturned = () => {
    setDepositSubmitting(true)
    router.patch(`/host/bookings/${id}/deposit`, { deposit_status: 'returned' }, {
      preserveScroll: true,
      onSuccess: () => {
        setDepositStatus('returned')
        setToast({ open: true, message: t('host.bookings.deposit_status_updated'), severity: 'success' })
      },
      onFinish: () => setDepositSubmitting(false),
    })
  }

  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault()
    setDepositSubmitting(true)
    setDepositErrors({})
    router.patch(`/host/bookings/${id}/deposit`, { deposit_status: 'disputed', deposit_dispute_reason: disputeReasonInput }, {
      preserveScroll: true,
      onSuccess: () => {
        setDepositStatus('disputed')
        setDepositDisputeReason(disputeReasonInput)
        setShowDisputeForm(false)
        setToast({ open: true, message: t('host.bookings.deposit_status_updated'), severity: 'success' })
      },
      onError: (errors) => setDepositErrors(errors as Record<string, string>),
      onFinish: () => setDepositSubmitting(false),
    })
  }

  const handleSubmitGuestReview = (e: React.FormEvent) => {
    e.preventDefault()
    setReviewSubmitting(true)
    setReviewErrors({})
    router.post(`/host/bookings/${id}/review`, { rating: reviewRating, comment: reviewComment }, {
      preserveScroll: true,
      onSuccess: () => {
        setSubmittedReview({ rating: reviewRating, comment: reviewComment, createdAt: new Date().toISOString().slice(0, 10) })
        setToast({ open: true, message: t('host.bookings.guest_review_submitted'), severity: 'success' })
      },
      onError: (errors) => setReviewErrors(errors as Record<string, string>),
      onFinish: () => setReviewSubmitting(false),
    })
  }

  const statusColor = getBookingStatusColor(currentStatus.toLowerCase())

  const paymentStatusColors: Record<string, string> = {
    paid: '#10B981',
    pending: '#F59E0B',
    unpaid: '#EF4444',
  }
  const paymentStatusLabels: Record<string, string> = {
    paid: t('host.bookings.payment_paid') || 'Paid',
    pending: t('host.bookings.payment_pending') || 'Payment pending',
    unpaid: t('host.bookings.payment_unpaid') || 'Unpaid',
  }
  const paymentStatusColor = paymentStatusColors[booking.paymentStatus] || '#717171'

  const handleStatusChange = (newStatus: string) => {
    // newStatus from MenuItem is raw lowercase value (e.g. 'confirmed')
    const rawStatus = newStatus.toLowerCase().replace(/ /g, '_')
    router.patch(`/host/bookings/${id}/status`, { status: rawStatus }, {
      onSuccess: () => {
        setCurrentStatus(newStatus)
        setToast({ open: true, message: t('host.bookings.status_updated'), severity: 'success' })
      },
      onError: () => setToast({ open: true, message: t('host.bookings.update_failed'), severity: 'error' })
    })
  }

  return (
    <>
      <Head title={t('host.bookings.view_booking_title')} />
      <HostLayout title={t('host.bookings.view_booking_title')}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
        <Button
          startIcon={<RtlBackArrowIcon />}
          onClick={() => router.visit('/host/bookings')}
          sx={{
            color: '#717171',
            textTransform: 'none',
            '&:hover': { bgcolor: '#F9FAFB', color: '#222222' },
            ...adminButtonStartIconSx,
          }}
        >
          {t('host.bookings.back_to_bookings')}
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => router.visit(`/host/bookings/${id}/edit`)}
          fullWidth={window.innerWidth < 600}
          sx={{
            bgcolor: '#AD542D',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { bgcolor: '#78381C' },
            ...adminButtonStartIconSx,
          }}
        >
          {t('host.bookings.edit_booking_title')}
        </Button>
      </Stack>

      {/* Booking Header */}
      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'flex-start' }} justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#222222', mb: 2 }}>
                {t('host.bookings.booking_ref').replace(':id', String(booking.id))}
              </Typography>
              <Typography sx={{ color: '#717171', fontSize: 14 }}>
                Created {new Date(booking.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
              <Typography sx={{ color: '#717171', fontSize: 14, fontFamily: 'monospace', mt: 0.5 }}>
                {t('host.bookings.reference') || 'Reference'}: {booking.reference}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                <Typography sx={{ color: '#717171', fontSize: 14 }}>{t('host.bookings.status')}:</Typography>
                <FormControl size="small">
                  <Select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    sx={{
                      minWidth: 150,
                      bgcolor: `${statusColor}15`,
                      color: statusColor,
                      fontWeight: 600,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: statusColor }
                    }}
                  >
                    {HOST_SELECTABLE_STATUSES.map((s) => (
                      <MenuItem key={s} value={s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}>
                        {getBookingStatusLabel(s)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                <Typography sx={{ color: '#717171', fontSize: 14 }}>{t('host.bookings.payment_status') || 'Payment'}:</Typography>
                <Chip
                  label={paymentStatusLabels[booking.paymentStatus] || booking.paymentStatus}
                  size="small"
                  sx={{ bgcolor: `${paymentStatusColor}15`, color: paymentStatusColor, fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222' }}>
                {booking.amount}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Row>
        <Col xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>
                {t('host.bookings.guest_information')}
              </Typography>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('host.bookings.guest_name')}</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.guest}</Typography>
                  </Box>
                </Stack>
                <Divider />
                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <EmailIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('host.bookings.email_address')}</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.guestEmail}</Typography>
                  </Box>
                </Stack>
                <Divider />
                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PhoneIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('host.bookings.phone_number')}</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.guestPhone}</Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 3 }}>
                {t('host.bookings.booking_details')}
              </Typography>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <HotelIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('host.bookings.property_label')}</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>{booking.property}</Typography>
                    <Typography sx={{ fontSize: 12, color: '#717171' }}>{booking.propertyLocation}</Typography>
                  </Box>
                </Stack>
                <Divider />
                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('host.bookings.check_in')}</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>
                      {new Date(booking.checkin).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Stack>
                <Divider />
                <Stack direction="row" spacing={2} useFlexGap alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: 20, color: '#717171' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#717171', mb: 0.5 }}>{t('host.bookings.check_out')}</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#222222' }}>
                      {new Date(booking.checkout).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Stack>
                <Divider />
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#717171', mb: 1 }}>{t('host.bookings.total_amount')}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222' }}>
                    {booking.amount}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#717171', mt: 0.5 }}>
                    {booking.nights}
                    {booking.nights === 1 ? t('host.earnings.night') : t('host.earnings.nights')}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Col>
      </Row>

      {booking.depositAmount > 0 && (
        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: depositStatus === 'disputed' && depositDisputeReason ? 2 : 0 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 0.5 }}>
                  {t('host.bookings.security_deposit')}
                </Typography>
                <Typography sx={{ color: '#717171', fontSize: 14 }}>
                  ${Number(booking.depositAmount).toFixed(2)}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Chip
                  label={
                    depositStatus === 'returned' ? t('host.bookings.deposit_returned') :
                    depositStatus === 'disputed' ? t('host.bookings.deposit_disputed') :
                    t('host.bookings.deposit_held')
                  }
                  size="small"
                  sx={{
                    bgcolor: `${depositStatus === 'returned' ? '#10B981' : depositStatus === 'disputed' ? '#EF4444' : '#F59E0B'}15`,
                    color: depositStatus === 'returned' ? '#10B981' : depositStatus === 'disputed' ? '#EF4444' : '#F59E0B',
                    fontWeight: 600,
                  }}
                />
                {canManageDeposit && depositStatus === 'held' && !showDisputeForm && (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={depositSubmitting}
                      onClick={handleMarkDepositReturned}
                      sx={{ borderColor: '#D0D5DD', color: '#344054', textTransform: 'none', '&:hover': { borderColor: '#D0D5DD', bgcolor: '#F9FAFB' } }}
                    >
                      {t('host.bookings.mark_deposit_returned')}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={depositSubmitting}
                      onClick={() => setShowDisputeForm(true)}
                      sx={{ borderColor: '#FCA5A5', color: '#EF4444', textTransform: 'none', '&:hover': { borderColor: '#FCA5A5', bgcolor: '#FEF2F2' } }}
                    >
                      {t('host.bookings.dispute_deposit')}
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>

            {depositStatus === 'disputed' && depositDisputeReason && (
              <Typography sx={{ color: '#991B1B', fontSize: 13, bgcolor: '#FEF2F2', p: 1.5, borderRadius: 1 }}>
                {depositDisputeReason}
              </Typography>
            )}

            {showDisputeForm && (
              <Box component="form" onSubmit={handleSubmitDeposit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={disputeReasonInput}
                  onChange={(e) => setDisputeReasonInput(e.target.value)}
                  placeholder={t('host.bookings.dispute_reason_placeholder')}
                  size="small"
                  error={Boolean(depositErrors.deposit_dispute_reason)}
                  helperText={depositErrors.deposit_dispute_reason}
                  sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <Stack direction="row" spacing={1.5}>
                  <Button
                    type="submit"
                    size="small"
                    variant="contained"
                    disabled={depositSubmitting || !disputeReasonInput.trim()}
                    sx={{ bgcolor: '#EF4444', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#DC2626' } }}
                  >
                    {t('host.bookings.submit_dispute')}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => { setShowDisputeForm(false); setDisputeReasonInput('') }}
                    sx={{ color: '#717171', textTransform: 'none' }}
                  >
                    {t('host.bookings.cancel')}
                  </Button>
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {submittedReview ? (
        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 2 }}>
              {t('host.bookings.your_review_of_guest')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.25, mb: 1.5 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} sx={{ fontSize: 24, color: star <= submittedReview.rating ? '#ffc107' : '#e9ecef' }} />
              ))}
            </Box>
            {submittedReview.comment && (
              <Typography sx={{ color: '#4A5568', fontSize: 14, mb: 1 }}>{submittedReview.comment}</Typography>
            )}
            <Typography sx={{ color: '#9CA3AF', fontSize: 12 }}>
              {new Date(submittedReview.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </CardContent>
        </Card>
      ) : canReviewGuest ? (
        <Paper component="form" onSubmit={handleSubmitGuestReview} elevation={0} sx={{ p: { xs: 2, md: 4 }, border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#222222', mb: 2 }}>
            {t('host.bookings.review_guest')}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 0.25 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Box
                  key={star}
                  component="button"
                  type="button"
                  onClick={() => setReviewRating(star)}
                  sx={{
                    p: 0,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    '&:hover .guest-review-star': { color: '#ffdb4d' },
                    '&:focus': { outline: 'none' },
                  }}
                  aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
                >
                  <StarIcon
                    className="guest-review-star"
                    sx={{ fontSize: 32, color: star <= reviewRating ? '#ffc107' : '#e9ecef', transition: 'color 0.2s' }}
                  />
                </Box>
              ))}
            </Box>
            {reviewErrors.rating && <Typography sx={{ color: '#d32f2f', fontSize: '0.75rem', mt: 0.5 }}>{reviewErrors.rating}</Typography>}
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder={t('host.bookings.review_guest_placeholder')}
            variant="outlined"
            size="small"
            inputProps={{ maxLength: 2000 }}
            error={Boolean(reviewErrors.comment)}
            helperText={reviewErrors.comment}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={reviewSubmitting || reviewRating < 1}
            sx={{ bgcolor: '#AD542D', '&:hover': { bgcolor: '#78381C' }, textTransform: 'none', fontWeight: 600 }}
          >
            {reviewSubmitting ? '...' : t('host.bookings.submit_guest_review')}
          </Button>
        </Paper>
      ) : null}
      </HostLayout>

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />
    </>
  )
}

