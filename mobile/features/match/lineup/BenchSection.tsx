import { T } from '@/constants/theme';
import type { TeamLineup } from '@/context/auth';
import { StyleSheet, Text, View } from 'react-native';
import { POS_SHORT } from '../utils/lineup';

export function BenchSection({
  homeTeam,
  awayTeam,
}: {
  homeTeam: TeamLineup;
  awayTeam: TeamLineup;
}) {
  const homeName = homeTeam.club.shortName ?? homeTeam.club.name;
  const awayName = awayTeam.club.shortName ?? awayTeam.club.name;
  const maxLen = Math.max(homeTeam.bench.length, awayTeam.bench.length);
  if (maxLen === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.teamLeft}>{homeName.toUpperCase()}</Text>
        <Text style={styles.label}>KLUPA</Text>
        <Text style={styles.teamRight}>{awayName.toUpperCase()}</Text>
      </View>
      {Array.from({ length: maxLen }).map((_, i) => {
        const hp = homeTeam.bench[i];
        const ap = awayTeam.bench[i];
        return (
          <View key={i} style={[styles.row, i < maxLen - 1 && styles.rowBorder]}>
            <View style={styles.cell}>
              {hp && (
                <>
                  <Text style={styles.num}>{hp.number ?? '—'}</Text>
                  <Text style={styles.name} numberOfLines={1}>
                    {hp.lastName}
                  </Text>
                  <View style={styles.posBadge}>
                    <Text style={styles.posText}>
                      {POS_SHORT[hp.position ?? ''] ?? '—'}
                    </Text>
                  </View>
                </>
              )}
            </View>
            <View style={styles.divider} />
            <View style={[styles.cell, styles.cellRight]}>
              {ap && (
                <>
                  <View style={styles.posBadge}>
                    <Text style={styles.posText}>
                      {POS_SHORT[ap.position ?? ''] ?? '—'}
                    </Text>
                  </View>
                  <Text
                    style={[styles.name, { textAlign: 'right' }]}
                    numberOfLines={1}
                  >
                    {ap.lastName}
                  </Text>
                  <Text style={styles.num}>{ap.number ?? '—'}</Text>
                </>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.hairline,
    overflow: 'hidden',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: T.hairline,
    backgroundColor: T.surfaceHi,
  },
  teamLeft: {
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
    color: T.red,
    letterSpacing: 0.8,
  },
  teamRight: {
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
    color: T.red,
    letterSpacing: 0.8,
    textAlign: 'right',
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    color: T.textFaint,
    letterSpacing: 1.5,
    marginHorizontal: 10,
  },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: T.hairline },
  cell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 5,
  },
  cellRight: { justifyContent: 'flex-end' },
  divider: { width: 1, backgroundColor: T.hairline, alignSelf: 'stretch' },
  num: {
    width: 18,
    fontSize: 10,
    fontWeight: '700',
    color: T.textFaint,
    textAlign: 'center',
  },
  name: { flex: 1, fontSize: 12, fontWeight: '500', color: T.text },
  posBadge: {
    width: 26,
    height: 18,
    borderRadius: 5,
    backgroundColor: T.surfaceHi,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.hairline,
    flexShrink: 0,
  },
  posText: { fontSize: 8, fontWeight: '800', color: T.textFaint },
});
