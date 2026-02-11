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
      <section className="hero-section">
        <Container>
          <Box className="hero-content">
            <Row className="justify-content-center">
              <Col lg={8} className="text-center">
                <Typography component="h1" className="hero-title">{t('about.title')}</Typography>
                <Typography className="hero-subtitle">
                  {t('about.subtitle')}
                </Typography>
              </Col>
            </Row>
          </Box>
        </Container>
      </section>
      <HowItWorks />
      <ChooseUs />
      <CtaReady />
      <Footer />
    </div>
  )
}
