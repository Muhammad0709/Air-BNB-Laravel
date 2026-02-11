import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Container, Row, Col } from 'react-bootstrap'
import ListingPreviewCard from '../components/ListingPreviewCard'
import BookingSummaryCard from '../components/BookingSummaryCard'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { router, Head, usePage } from '@inertiajs/react'
import { useLanguage } from '../hooks/use-language'

const PLACEHOLDER_IMAGE = '/images/popular-stay-1.svg'

type ConfirmationProperty = {
  id: number
  title: string
  location: string
  image: string
  price: number
  bedrooms: number
  bathrooms: number
  guests: number
  reviews_count: number
  rating: number
}

type ConfirmationPageProps = {
  property: ConfirmationProperty | null
  nights: number
  checkin: string | null
  checkout: string | null
  costs: Array<{ label: string; amount: string }>
  totalAmount: string
  rules: string[]
}

export default function Confirmation() {
  const { t } = useLanguage()
  const { property, costs, totalAmount, rules } = usePage<ConfirmationPageProps>().props

  return (
    <>
      <Head title={t('confirmation.title')} />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box className="confirmation-page" sx={{ flex: 1 }}>
          <Container>
            <Box className="confirmation-content">
              <Box className="success-icon-wrapper">
                <CheckCircleIcon className="success-icon" />
              </Box>
              <Typography className="confirmation-title">{t('confirmation.request_submitted')}</Typography>
              <Typography className="confirmation-subtitle">{t('confirmation.request_submitted_subtitle')}</Typography>
            </Box>

            <Row className="justify-content-center">
              <Col xs={12} md={10} lg={8}>
                <ListingPreviewCard
                  image={property?.image ?? PLACEHOLDER_IMAGE}
                  title={property?.title ?? t('confirmation.your_booking')}
                  location={property?.location ?? '—'}
                  reviews={property?.reviews_count ?? 0}
                  rating={property?.rating ?? 0}
                />
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col xs={12} md={10} lg={8}>
                <BookingSummaryCard
                  rules={rules}
                  costs={costs}
                  totalLabel={t('confirmation.total')}
                  totalAmount={totalAmount}
                />
              </Col>
            </Row>

            <Box className="return-btn-wrapper">
              <Button
                variant="contained"
                className="return-home-btn"
                onClick={() => router.visit('/')}
              >
                {t('confirmation.return_to_home')}
              </Button>
            </Box>
          </Container>
        </Box>
        <Footer />
      </Box>
    </>
  )
}
