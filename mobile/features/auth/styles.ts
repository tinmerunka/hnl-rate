import { T } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

  fields: { gap: 16, marginBottom: 8 },
  forgotWrap: { alignSelf: 'flex-end', marginTop: 2 },
  forgot: { fontSize: 13, color: T.textDim, fontWeight: '500' },

  cta: { gap: 16, paddingBottom: 8 },
  btnPrimary: {
    height: 52,
    borderRadius: 14,
    backgroundColor: T.red,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: T.red,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: { fontSize: 14, color: T.textDim },
  switchLink: { fontSize: 14, color: T.text, fontWeight: '700' },
});
