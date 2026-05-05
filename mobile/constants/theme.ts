export const T = {
  bg: '#06070A',
  surface: '#101218',
  surfaceHi: '#161922',
  hairline: 'rgba(255,255,255,0.06)',
  hairlineStrong: 'rgba(255,255,255,0.10)',
  text: '#F5F6F8',
  textDim: '#9097A3',
  textFaint: '#5A6070',
  red: '#E11D2A',
  redHi: '#FF2E3D',
  redGlow: 'rgba(225,29,42,0.35)',
  win: '#27C36F',
  loss: '#E5484D',
  draw: '#F5A524',
} as const;

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
  },
  dark: {
    text: T.text,
    background: T.bg,
    tint: T.red,
    icon: T.textDim,
    tabIconDefault: T.textFaint,
    tabIconSelected: T.red,
  },
};
