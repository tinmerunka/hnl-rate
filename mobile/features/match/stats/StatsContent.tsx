import { T } from '@/constants/theme';
import type { MatchStatistics } from '@/context/auth';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatRow } from './StatRow';

function StatsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function StatsContent({
  stats,
  homeClub,
  awayClub,
}: {
  stats: MatchStatistics;
  homeClub: string;
  awayClub: string;
}) {
  return (
    <View>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{homeClub}</Text>
        <Text style={styles.teamName}>{awayClub}</Text>
      </View>

      <StatsSection title="Udarci">
        <StatRow label="Udarci u okvir" pair={stats.shotsOnGoal} barColor={T.red} />
        <StatRow label="Udarci pored" pair={stats.shotsOffGoal} />
        <StatRow label="Ukupno udaraca" pair={stats.totalShots} />
        <StatRow label="Blokirani" pair={stats.blockedShots} />
        <StatRow label="Iz 16m" pair={stats.shotsInsidebox} />
        <StatRow label="Izvan 16m" pair={stats.shotsOutsidebox} />
      </StatsSection>

      <StatsSection title="Disciplina">
        <StatRow label="Prekršaji" pair={stats.fouls} />
        <StatRow label="Žuti kartoni" pair={stats.yellowCards} barColor="#F5A524" />
        <StatRow label="Crveni kartoni" pair={stats.redCards} barColor={T.red} />
      </StatsSection>

      <StatsSection title="Posjed lopte">
        <StatRow label="Posjed %" pair={stats.ballPossession} barColor={T.win} />
        <StatRow label="Korneri" pair={stats.cornerKicks} />
        <StatRow label="Zaleđa" pair={stats.offsides} />
      </StatsSection>

      <StatsSection title="Dodavanja">
        <StatRow label="Ukupno dodavanja" pair={stats.totalPasses} />
        <StatRow label="Točna" pair={stats.passesAccurate} barColor={T.win} />
        <StatRow label="Točnost %" pair={stats.passesPercent} barColor={T.win} />
      </StatsSection>

      <StatsSection title="Vratar">
        <StatRow label="Obrane" pair={stats.goalkeeperSaves} />
      </StatsSection>
    </View>
  );
}

const styles = StyleSheet.create({
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.hairline,
  },
  teamName: { color: T.text, fontSize: 13, fontWeight: '700' },
  sectionTitle: {
    color: T.textFaint,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
});
