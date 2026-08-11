import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { Box, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PaymentIcon from '@mui/icons-material/Payment'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import { useLanguage } from '../hooks/use-language'

const stepKeys = [
  { title: 'about.step1_title', desc: 'about.step1_desc', Icon: SearchIcon },
  { title: 'about.step2_title', desc: 'about.step2_desc', Icon: PaymentIcon },
  { title: 'about.step3_title', desc: 'about.step3_desc', Icon: EventAvailableIcon },
] as const

export default function HowItWorks() {
  const { t } = useLanguage()
  return (
    <section className="how-works">
      <Container>
        <Typography component="h2" className="how-title">
          {t('about.how_title')}
        </Typography>
        <Typography className="mb-5 how-sub">
          {t('about.how_sub')}
        </Typography>

        <Row className="g-5 how-grid">
          {stepKeys.map((s, i) => (
            <Col key={i} xs={12} md={4}>
              <Box className="how-card">
                <Box className="how-icon">
                  <s.Icon sx={{ fontSize: 34, color: '#fff' }} />
                </Box>
                <Typography component="h3" className="how-card-title">
                  {t(s.title)}
                </Typography>
                <Typography className="how-card-desc">{t(s.desc)}</Typography>
              </Box>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

