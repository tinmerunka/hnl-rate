import { T } from '@/constants/theme';
import type { LineupPlayer } from '@/context/auth';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const CHIP = 30;
export const WRAP = 46;

export function PlayerDot({
  player,
  x,
  y,
  isHome,
  selected,
  isBest,
  isWorst,
  onSelect,
}: {
  player: LineupPlayer;
  x: number;
  y: number;
  isHome: boolean;
  selected?: boolean;
  isBest?: boolean;
  isWorst?: boolean;
  onSelect?: (p: LineupPlayer) => void;
}) {
  const ringStyle = isBest
    ? styles.chipRingBest
    : isWorst
      ? styles.chipRingWorst
      : isHome
        ? styles.chipRingHome
        : styles.chipRingAway;

  return (
    <TouchableOpacity
      style={[styles.playerWrap, { left: x - WRAP / 2, top: y - CHIP / 2 - 5 }]}
      onPress={() => onSelect?.(player)}
      activeOpacity={onSelect ? 0.7 : 1}
      disabled={!onSelect}
    >
      <View style={[styles.chipRing, ringStyle, selected && styles.chipRingSelected]}>
        <View
          style={[
            styles.chip,
            isHome ? styles.chipHome : styles.chipAway,
            selected && styles.chipSelected,
          ]}
        >
          <Text style={[styles.chipNum, isHome ? styles.chipNumHome : styles.chipNumAway]}>
            {player.number ?? '?'}
          </Text>
        </View>
      </View>
      <Text style={styles.chipName} numberOfLines={1}>
        {player.lastName}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  playerWrap: { position: 'absolute', width: WRAP, alignItems: 'center' },
  chipRing: {
    width: CHIP + 4,
    height: CHIP + 4,
    borderRadius: (CHIP + 4) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },
  chipRingHome: { backgroundColor: 'rgba(255,255,255,0.2)' },
  chipRingAway: { backgroundColor: 'rgba(180,0,0,0.3)' },
  chipRingSelected: { backgroundColor: 'rgba(225,29,42,0.55)' },
  chipRingBest: { backgroundColor: 'rgba(39,195,111,0.45)' },
  chipRingWorst: { backgroundColor: 'rgba(229,72,77,0.45)' },
  chip: {
    width: CHIP,
    height: CHIP,
    borderRadius: CHIP / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipHome: { backgroundColor: '#FFFFFF' },
  chipAway: { backgroundColor: '#CC0000' },
  chipSelected: { backgroundColor: T.red },
  chipNum: { fontSize: 11, fontWeight: '800' },
  chipNumHome: { color: '#111111' },
  chipNumAway: { color: '#FFFFFF' },
  chipName: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginTop: 3,
    maxWidth: WRAP,
    textShadowColor: 'rgba(0,0,0,0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
