import { T } from '@/constants/theme';
import type { StatPair } from '@/context/auth';
import { Text, View } from 'react-native';

export function StatRow({
  label,
  pair,
  barColor = T.textDim,
}: {
  label: string;
  pair: StatPair;
  barColor?: string;
}) {
  const h = pair.home ?? 0;
  const a = pair.away ?? 0;
  const total = h + a;
  const homePct = total > 0 ? h / total : 0.5;
  const awayPct = total > 0 ? a / total : 0.5;
  const fmt = (v: number | null) => (v === null ? '–' : String(v));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <Text
        style={{
          width: 32,
          color: T.text,
          fontSize: 13,
          fontWeight: '600',
          textAlign: 'left',
        }}
      >
        {fmt(pair.home)}
      </Text>
      <View style={{ flex: 1, marginHorizontal: 10 }}>
        <Text
          style={{
            color: T.textDim,
            fontSize: 11,
            textAlign: 'center',
            marginBottom: 4,
          }}
        >
          {label}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            height: 4,
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: T.surface,
          }}
        >
          <View style={{ flex: homePct, backgroundColor: barColor, opacity: 0.85 }} />
          <View style={{ flex: awayPct, backgroundColor: T.surfaceHi }} />
        </View>
      </View>
      <Text
        style={{
          width: 32,
          color: T.text,
          fontSize: 13,
          fontWeight: '600',
          textAlign: 'right',
        }}
      >
        {fmt(pair.away)}
      </Text>
    </View>
  );
}
