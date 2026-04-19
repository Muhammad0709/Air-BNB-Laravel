import type { SxProps, Theme } from '@mui/material/styles'

/**
 * MUI has no ThemeProvider `direction` here, so Button `startIcon` gets LTR physical margins (.css-…).
 * Scope with `html[dir]` so RTL matches Blade + client `dir` without relying on hook timing.
 */
export const adminButtonStartIconSx: SxProps<Theme> = {
  'html[dir="ltr"] &': {
    '& .MuiButton-startIcon': {
      marginRight: '8px !important',
      marginLeft: '-4px !important',
    },
  },
  'html[dir="rtl"] &': {
    '& .MuiButton-startIcon': {
      marginRight: '0 !important',
      marginLeft: '8px !important',
    },
  },
}
