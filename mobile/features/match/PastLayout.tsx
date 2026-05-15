import { ClubLogo } from '@/components/ClubLogo';
import { T } from '@/constants/theme';
import { type Match, type MatchLineup, useAuth } from '@/context/auth';
import { dateStr } from '@/utils/date';
import { scoreColorFor } from '@/utils/score';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMatchExtras } from './hooks/useMatchExtras';
import { RateModal } from './rating/RateModal';
import { BuzzTab } from './tabs/BuzzTab';
import { FirstXITab } from './tabs/FirstXITab';
import { StatsTab } from './tabs/StatsTab';
import { TabBar, type TabId } from './tabs/TabBar';

export function PastLayout({
  match,
  lineup,
  lineupLoading,
  insets,
  onBack,
}: {
  match: Match;
  lineup: MatchLineup | null;
  lineupLoading: boolean;
  insets: { top: number };
  onBack: () => void;
}) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('buzz');
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const {
    communityRatings,
    setCommunityRatings,
    ratingsLoading,
    matchStats,
    statsLoading,
    statsError,
    loadStats,
  } = useMatchExtras(match.id, token);

  const [homeScore, awayScore] = match.result
    ? match.result.split('-').map(Number)
    : [null, null];

  useEffect(() => {
    if (activeTab !== 'stats' || matchStats !== null || statsLoading) return;
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const motm = communityRatings?.playerRatings
    ?.filter((p) => p.bestPlayerVotes > 0)
    ?.sort((a, b) => b.bestPlayerVotes - a.bestPlayerVotes)[0];
  const motmName = motm ? `${motm.firstName} ${motm.lastName}` : undefined;

  return (
    <View style={styles.container}>
      <View style={[styles.heroWrap, { paddingTop: insets.top + 8 }]}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="chevron-back" size={20} color={T.text} />
          </TouchableOpacity>
          <Text style={styles.navMeta}>
            {match.round}. kolo · {dateStr(match.date)}
            {match.referee
              ? ` · ${match.referee.firstName[0]}. ${match.referee.lastName}`
              : ''}
          </Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.scoreRow}>
          <View style={styles.clubCol}>
            <ClubLogo club={match.homeClub} size={56} />
            <Text style={styles.clubName} numberOfLines={1}>
              {match.homeClub.shortName ?? match.homeClub.name}
            </Text>
          </View>

          <View style={styles.scoreCentre}>
            {homeScore != null && awayScore != null ? (
              <>
                <View style={styles.scoreNumRow}>
                  <Text
                    style={[
                      styles.scoreNum,
                      { color: scoreColorFor(homeScore, awayScore) },
                    ]}
                  >
                    {homeScore}
                  </Text>
                  <Text style={styles.scoreDash}>—</Text>
                  <Text
                    style={[
                      styles.scoreNum,
                      { color: scoreColorFor(awayScore, homeScore) },
                    ]}
                  >
                    {awayScore}
                  </Text>
                </View>
                <Text style={styles.ftLabel}>KRAJ UTAKMICE</Text>
              </>
            ) : (
              <Text style={styles.scoreDash}>–:–</Text>
            )}
          </View>

          <View style={[styles.clubCol, { alignItems: 'flex-end' }]}>
            <ClubLogo club={match.awayClub} size={56} />
            <Text
              style={[styles.clubName, { textAlign: 'right' }]}
              numberOfLines={1}
            >
              {match.awayClub.shortName ?? match.awayClub.name}
            </Text>
          </View>
        </View>

        {ratingsLoading ? (
          <View style={[styles.rateCta, { justifyContent: 'center' }]}>
            <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
          </View>
        ) : communityRatings?.userMatchRating != null ? (
          <View style={[styles.rateCta, styles.rateCtaDone]}>
            <View style={styles.rateCtaDoneLeft}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.rateCtaText}>Ocijenio si ovu utakmicu</Text>
            </View>
            <View style={styles.rateCtaBadge}>
              <Text style={styles.rateCtaBadgeText}>
                {communityRatings.userMatchRating}/10
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.rateCta}
            onPress={() => setRatingModalOpen(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.rateCtaText}>Ocijeni utakmicu</Text>
            <View style={styles.rateCtaRight}>
              <Text style={styles.rateCtaMeta}>4 kartice · 30s</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <TabBar active={activeTab} onPress={setActiveTab} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'buzz' && (
          <BuzzTab
            ratings={communityRatings}
            motmName={motmName}
            matchId={match.id}
            loading={ratingsLoading}
          />
        )}

        {activeTab === 'firstxi' && (
          <FirstXITab lineup={lineup} loading={lineupLoading} />
        )}

        {activeTab === 'stats' && (
          <StatsTab
            stats={matchStats}
            loading={statsLoading}
            error={statsError}
            onRetry={loadStats}
            homeClub={match.homeClub.shortName ?? match.homeClub.name}
            awayClub={match.awayClub.shortName ?? match.awayClub.name}
          />
        )}
      </ScrollView>

      {token && (
        <RateModal
          visible={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          matchId={match.id}
          token={token}
          lineup={lineup}
          hasReferee={!!match.referee}
          refereeLabel={
            match.referee
              ? `${match.referee.firstName[0]}. ${match.referee.lastName}`
              : undefined
          }
          onDone={(ratings) => setCommunityRatings(ratings)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  heroWrap: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.hairline,
    marginBottom: 16,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.hairline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navMeta: {
    fontSize: 11,
    color: T.textFaint,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  clubCol: { flex: 1, alignItems: 'flex-start', gap: 8 },
  clubName: { fontSize: 12, fontWeight: '700', color: T.text },
  scoreCentre: { alignItems: 'center', gap: 4 },
  scoreNumRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreNum: {
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 56,
  },
  scoreDash: { fontSize: 26, fontWeight: '600', color: T.textFaint },
  ftLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: T.textFaint,
    letterSpacing: 0.8,
  },

  rateCta: {
    height: 56,
    borderRadius: 16,
    backgroundColor: T.red,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    shadowColor: T.red,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  rateCtaDone: { backgroundColor: 'rgba(225,29,42,0.5)', shadowOpacity: 0.15 },
  rateCtaDoneLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rateCtaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  rateCtaBadgeText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  rateCtaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  rateCtaRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rateCtaMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
});
