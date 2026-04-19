import React from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useLanguage } from '../hooks/use-language'

/** In RTL, “back” should point toward the trailing edge (visually right); MUI ArrowBack stays LTR-shaped otherwise. */
export default function RtlBackArrowIcon(props: React.ComponentProps<typeof ArrowBackIcon>) {
  const { isRtl } = useLanguage()
  const Icon = isRtl ? ArrowForwardIcon : ArrowBackIcon
  return <Icon {...props} />
}
