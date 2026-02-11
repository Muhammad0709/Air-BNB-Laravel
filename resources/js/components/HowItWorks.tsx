import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { Box, Typography } from '@mui/material'
import { useLanguage } from '../hooks/use-language'
// Images served from public directory
const howWorkIcon = '/images/how-work.svg'

const stepKeys = [
  { title: 'about.step1_title', desc: 'about.step1_desc' },
  { title: 'about.step2_title', desc: 'about.step2_desc' },
  { title: 'about.step3_title', desc: 'about.step3_desc' },
] as const

export default function HowItWorks() {
  const { t } = useLanguage()
  return (
    <section className="how-works">
      <Container>
        <Typography component="h2" className="how-title">
          {t('about.how_title')}
        </Typography>
        <Typography className="how-sub">
          {t('about.how_sub')}
        </Typography>

        <Row className="g-4 how-grid">
          {stepKeys.map((s, i) => (
            <Col key={i} xs={12} md={4}>
              <Box className="how-card">
                <Box className="how-icon">
                  <img src={howWorkIcon} alt="step" />
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

