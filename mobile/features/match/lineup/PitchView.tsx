import type { LineupPlayer, MatchLineup } from '@/context/auth';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { computeFormation, computePositions } from '../utils/lineup';
import { PlayerDot, WRAP } from './PlayerDot';

export function PitchView({
  lineup,
  selectable,
  selected,
  bestPlayerId,
  worstPlayerId,
  onSelect,
}: {
  lineup: MatchLineup;
  selectable?: boolean;
  selected?: number | null;
  bestPlayerId?: number | null;
  worstPlayerId?: number | null;
  onSelect?: (p: LineupPlayer) => void;
}) {
  const { width } = useWindowDimensions();
  const pW = width - 40;
  const pH = Math.round(pW * 1.45);
  const halfH = pH / 2;

  const homePos = computePositions(lineup.homeTeam.startingXI, true, pW, pH);
  const awayPos = computePositions(lineup.awayTeam.startingXI, false, pW, pH);

  const homeName = lineup.homeTeam.club.shortName ?? lineup.homeTeam.club.name;
  const awayName = lineup.awayTeam.club.shortName ?? lineup.awayTeam.club.name;
  const homeFormation = computeFormation(lineup.homeTeam.startingXI);
  const awayFormation = computeFormation(lineup.awayTeam.startingXI);

  const penW = pW * 0.56;
  const penH = pH * 0.125;
  const penLeft = (pW - penW) / 2;
  const goalW = pW * 0.28;
  const goalH = pH * 0.055;
  const goalLeft = (pW - goalW) / 2;

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={[styles.field, { width: pW, height: pH }]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.stripe,
              { top: i * (pH / 8), height: pH / 8, opacity: i % 2 === 0 ? 0.07 : 0 },
            ]}
          />
        ))}
        <View style={[styles.line, { top: 10, left: 10, right: 10, height: 1 }]} />
        <View style={[styles.line, { bottom: 10, left: 10, right: 10, height: 1 }]} />
        <View style={[styles.line, { top: 10, left: 10, bottom: 10, width: 1 }]} />
        <View style={[styles.line, { top: 10, right: 10, bottom: 10, width: 1 }]} />
        <View style={[styles.line, { top: halfH, left: 10, right: 10, height: 1 }]} />
        <View style={[styles.centerCircle, { top: halfH - 40, left: pW / 2 - 40 }]} />
        <View style={[styles.dot, { top: halfH - 3, left: pW / 2 - 3 }]} />
        <View style={[styles.penArea, { top: 10, left: penLeft, width: penW, height: penH }]} />
        <View style={[styles.penArea, { bottom: 10, left: penLeft, width: penW, height: penH }]} />
        <View style={[styles.penArea, { top: 10, left: goalLeft, width: goalW, height: goalH }]} />
        <View style={[styles.penArea, { bottom: 10, left: goalLeft, width: goalW, height: goalH }]} />

        <View style={[styles.teamLabel, { top: 14, left: 16 }]}>
          <Text style={styles.teamLabelText} numberOfLines={1}>
            {homeName.toUpperCase()}
          </Text>
          {homeFormation ? <Text style={styles.formationText}>{homeFormation}</Text> : null}
        </View>
        <View style={[styles.teamLabel, { bottom: 14, right: 16, alignItems: 'flex-end' }]}>
          <Text style={styles.teamLabelText} numberOfLines={1}>
            {awayName.toUpperCase()}
          </Text>
          {awayFormation ? <Text style={styles.formationText}>{awayFormation}</Text> : null}
        </View>

        {homePos.map(({ player, x, y }) => (
          <PlayerDot
            key={player.id}
            player={player}
            x={x}
            y={y}
            isHome
            selected={selected === player.id}
            isBest={bestPlayerId === player.id}
            isWorst={worstPlayerId === player.id}
            onSelect={selectable ? onSelect : undefined}
          />
        ))}
        {awayPos.map(({ player, x, y }) => (
          <PlayerDot
            key={player.id}
            player={player}
            x={x}
            y={y}
            isHome={false}
            selected={selected === player.id}
            isBest={bestPlayerId === player.id}
            isWorst={worstPlayerId === player.id}
            onSelect={selectable ? onSelect : undefined}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: '#1A6B20',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  stripe: { position: 'absolute', left: 0, right: 0, backgroundColor: '#000' },
  line: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.25)' },
  centerCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  penArea: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'transparent',
  },
  teamLabel: { position: 'absolute' },
  teamLabelText: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.8,
  },
  formationText: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  playerWrap: { position: 'absolute', width: WRAP, alignItems: 'center' },
});
