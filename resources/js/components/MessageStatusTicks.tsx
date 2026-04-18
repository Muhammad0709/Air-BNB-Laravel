import DoneAll from '@mui/icons-material/DoneAll'

/** WhatsApp-style delivery ticks on your own messages (double grey = sent/delivered, double blue = read). */
export function MessageStatusTicks({
  read,
  variant,
}: {
  read: boolean
  variant: 'onPrimary' | 'onSurface'
}) {
  const onPrimary = variant === 'onPrimary'
  return (
    <DoneAll
      aria-label={read ? 'Read' : 'Delivered'}
      sx={{
        fontSize: 15,
        flexShrink: 0,
        color: read
          ? onPrimary
            ? '#7DD3FC'
            : '#0284C7'
          : onPrimary
            ? 'rgba(255,255,255,0.88)'
            : 'rgba(55, 65, 81, 0.65)',
      }}
    />
  )
}
