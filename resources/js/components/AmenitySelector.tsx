import { Box, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material'

type Props = {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
}

export default function AmenitySelector({ options, value, onChange }: Props) {
  if (!options.length) return null

  return (
    <Box sx={{ mt: 4, bgcolor: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '12px', p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>Amenities</Typography>
      <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
        {options.map((amenity) => (
          <FormControlLabel
            key={amenity}
            label={amenity}
            control={
              <Checkbox
                checked={value.includes(amenity)}
                onChange={(e) => onChange(
                  e.target.checked ? [...value, amenity] : value.filter((item) => item !== amenity)
                )}
              />
            }
          />
        ))}
      </Stack>
    </Box>
  )
}
