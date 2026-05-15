import { T } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const feedStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 4,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: T.red,
    overflow: 'hidden',
    position: 'relative',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: T.text, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: T.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.hairline,
  },

  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  section: { marginBottom: 24 },

  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  liveBullet: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: T.red,
    shadowColor: T.red,
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  liveLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: T.red,
    letterSpacing: 1,
  },
  hairline: { flex: 1, height: 1, backgroundColor: T.hairline },
  liveCount: { fontSize: 11, color: T.textFaint, fontWeight: '600' },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: { color: T.textFaint, fontSize: 15, fontWeight: '500' },

  errorWrap: { paddingTop: 80, alignItems: 'center', gap: 12 },
  errorTitle: { fontSize: 17, fontWeight: '700', color: T.text },
  errorSub: { fontSize: 13, color: T.textDim, textAlign: 'center', maxWidth: 260 },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.hairline,
  },
  retryText: { fontSize: 14, fontWeight: '600', color: T.text },
});
