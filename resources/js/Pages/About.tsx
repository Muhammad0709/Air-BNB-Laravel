import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HowItWorks from '../components/HowItWorks'
import ChooseUs from '../components/ChooseUs'
import CtaReady from '../components/CtaReady'
import { Container, Row, Col } from 'react-bootstrap'
import { Box, Typography } from '@mui/material'
import { Head } from '@inertiajs/react'
import { useLanguage } from '../hooks/use-language'

export default function About() {
  const { t } = useLanguage()
  return (
    <div className="about-page">
      <Head title={t('about.title')} />
      <Navbar />
      <section className="about-hero">
        <Box className="about-hero-overlay" />
        <Container className="about-hero-content">
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <Typography component="p" className="about-hero-eyebrow">
                {t('about.eyebrow')}
              </Typography>
              <Typography component="h1" className="about-hero-title customer-page-title">{t('about.title')}</Typography>
              <Typography className="about-hero-subtitle">
                {t('about.subtitle')}
              </Typography>
            </Col>
          </Row>
        </Container>
      </section>
      <HowItWorks />
      <ChooseUs />
      <CtaReady />
      <Footer />
    </div>
  )
}
