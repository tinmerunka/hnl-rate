import { LineupPlayer, Match, MatchLineup, MatchRatings, PlayerRatingResult, TeamLineup, useAuth } from '@/context/auth';
import { getMatch, getMatchLineup, getMatchRatings, getUserRatings, rateAtmosphere, rateMatch, ratePlayers, rateReferee } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ── Helpers ─────────────────────────────────────────────────── */

const POS_SHORT: Record<string, string> = {
  Goalkeeper: 'GK', Defender: 'DF', Midfielder: 'MF', Attacker: 'FW',
};
const POS_COLOR: Record<string, string> = {
  Goalkeeper: '#1A2A0D', Defender: '#0D1A2A', Midfielder: '#1A1200', Attacker: '#1A0000',
};

/* ── Screen ──────────────────────────────────────────────────── */

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [lineup, setLineup] = useState<MatchLineup | null>(null);
  const [loading, setLoading] = useState(true);
  const [lineupLoading, setLineupLoading] = useState(false);

  const matchId = parseInt(id, 10);

  useEffect(() => {
    if (!token) return;

    getMatch(matchId, token)
      .then((m) => {
        setMatch(m);
        // Only fetch lineup for finished matches
        if (m.finished) {
          setLineupLoading(true);
          getMatchLineup(m.id, token)
            .then(setLineup)
            .catch(() => {})
            .finally(() => setLineupLoading(false));
        }
      })
      .catch((e) => Alert.alert('Error', e.message ?? 'Could not load match.'))
      .finally(() => setLoading(false));
  }, [matchId, token]);

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={[styles.backBtn, { position: 'absolute', top: insets.top + 12, left: 20 }]}
          onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <ActivityIndicator color="#CC0000" size="large" />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={[styles.backBtn, { position: 'absolute', top: insets.top + 12, left: 20 }]}
          onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.errorText}>Match not found.</Text>
      </View>
    );
  }

  return match.finished
    ? <PastMatchLayout
        match={match}
        lineup={lineup}
        lineupLoading={lineupLoading}
        insets={insets}
        onBack={() => router.back()}
      />
    : <UpcomingMatchLayout
        match={match}
        insets={insets}
        onBack={() => router.back()}
      />;
}

/* ── Upcoming match ──────────────────────────────────────────── */

function UpcomingMatchLayout({
  match, insets, onBack,
}: {
  match: Match; insets: { top: number }; onBack: () => void;
}) {
  const homeLogo = match.homeClub.crest ?? match.homeClub.logoUrl;
  const awayLogo = match.awayClub.crest ?? match.awayClub.logoUrl;
  const venue = match.homeClub.venue;

  const dateStr = new Date(match.date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.hero}>
        <ClubHeroCol name={match.homeClub.name} tla={match.homeClub.tla} logoUri={homeLogo} />
        <View style={styles.centreBox}>
          <Text style={styles.vsText}>vs</Text>
          <View style={styles.upcomingBadge}>
            <Text style={styles.upcomingBadgeText}>Upcoming</Text>
          </View>
        </View>
        <ClubHeroCol name={match.awayClub.name} tla={match.awayClub.tla} logoUri={awayLogo} align="right" />
      </View>

      <View style={styles.infoCard}>
        <InfoRow icon="trophy-outline" label="Round" value={`Round ${match.round}`} />
        <InfoRow icon="calendar-outline" label="Date" value={dateStr} last={!match.referee && !venue} />
        {match.referee && (
          <InfoRow
            icon="person-outline"
            label="Referee"
            value={`${match.referee.firstName} ${match.referee.lastName}`}
            last={!venue}
          />
        )}
        {venue && (
          <InfoRow icon="location-outline" label="Venue" value={venue} last />
        )}
      </View>
    </ScrollView>
  );
}

/* ── Past match ──────────────────────────────────────────────── */

function PastMatchLayout({
  match, lineup, lineupLoading, insets, onBack,
}: {
  match: Match;
  lineup: MatchLineup | null;
  lineupLoading: boolean;
  insets: { top: number };
  onBack: () => void;
}) {
  const { token } = useAuth();
  const homeLogo = match.homeClub.crest ?? match.homeClub.logoUrl;
  const awayLogo = match.awayClub.crest ?? match.awayClub.logoUrl;
  const [homeScore, awayScore] = match.result ? match.result.split('-') : ['?', '?'];

  const dateStr = new Date(match.date).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Score hero */}
      <View style={styles.hero}>
        <ClubHeroCol name={match.homeClub.name} tla={match.homeClub.tla} logoUri={homeLogo} />
        <View style={styles.centreBox}>
          <Text style={styles.scoreText}>{homeScore} – {awayScore}</Text>
          <View style={styles.ftBadge}>
            <Text style={styles.ftText}>FT</Text>
          </View>
        </View>
        <ClubHeroCol name={match.awayClub.name} tla={match.awayClub.tla} logoUri={awayLogo} align="right" />
      </View>

      {/* Match info */}
      <View style={styles.infoCard}>
        <InfoRow icon="trophy-outline" label="Round" value={`Round ${match.round}`} />
        <InfoRow icon="calendar-outline" label="Date" value={dateStr} last={!match.referee} />
        {match.referee && (
          <InfoRow
            icon="person-outline"
            label="Referee"
            value={`${match.referee.firstName} ${match.referee.lastName}`}
            last
          />
        )}
      </View>

      {/* Lineups */}
      {lineupLoading ? (
        <ActivityIndicator color="#CC0000" style={{ marginTop: 12 }} />
      ) : lineup ? (
        <PitchView lineup={lineup} />
      ) : (
        <View style={styles.noLineup}>
          <Text style={styles.noLineupText}>Lineup not available.</Text>
        </View>
      )}

      {/* Ratings */}
      {token && (
        <RatingsSection
          matchId={match.id}
          token={token}
          lineup={lineup}
          hasReferee={!!match.referee}
        />
      )}
    </ScrollView>
  );
}

/* ── Pitch view ──────────────────────────────────────────────── */

const CHIP = 30;
const WRAP = 46;

// Fallback row if no grid: infer from position string
function posToRow(position: string | undefined): number {
  if (!position) return 3;
  if (position === 'Goalkeeper') return 1;
  if (position === 'Defender') return 2;
  if (position === 'Midfielder') return 3;
  return 4; // Attacker or unknown
}

function computeFormation(players: LineupPlayer[]): string {
  const rowMap = new Map<number, number>();
  for (const p of players) {
    const row = p.grid ? parseInt(p.grid.split(':')[0], 10) : posToRow(p.position);
    rowMap.set(row, (rowMap.get(row) ?? 0) + 1);
  }
  const rows = Array.from(rowMap.keys()).sort((a, b) => a - b);
  return rows.slice(1).map(r => rowMap.get(r)!).join('-');
}

function computePositions(
  players: LineupPlayer[],
  isHome: boolean,
  pW: number,
  pH: number,
): { player: LineupPlayer; x: number; y: number }[] {
  // Group by row — use grid if available, otherwise infer from position
  const rowMap = new Map<number, LineupPlayer[]>();
  for (const p of players) {
    const row = p.grid ? parseInt(p.grid.split(':')[0], 10) : posToRow(p.position);
    if (!rowMap.has(row)) rowMap.set(row, []);
    rowMap.get(row)!.push(p);
  }

  const sortedRows = Array.from(rowMap.keys()).sort((a, b) => a - b);
  const numRows = sortedRows.length;
  const halfH = pH / 2;
  const padEdge = 34;
  const padCenter = 20;

  return sortedRows.flatMap((row, rowIndex) => {
    // Sort within row by grid column if available, else by original order
    const rowPlayers = rowMap.get(row)!.sort((a, b) => {
      const colA = a.grid ? parseInt(a.grid.split(':')[1], 10) : 0;
      const colB = b.grid ? parseInt(b.grid.split(':')[1], 10) : 0;
      return colA - colB;
    });
    const n = rowPlayers.length;
    const frac = rowIndex / Math.max(numRows - 1, 1);
    const y = isHome
      ? padEdge + frac * (halfH - padEdge - padCenter)
      : pH - padEdge - frac * (halfH - padEdge - padCenter);

    return rowPlayers.map((player, i) => ({
      player,
      x: (i + 1) / (n + 1) * pW,
      y,
    }));
  });
}

function PitchView({ lineup }: { lineup: MatchLineup }) {
  const { width } = useWindowDimensions();
  const pW = width - 40;
  const pH = Math.round(pW * 1.45);
  const halfH = pH / 2;

  const homePos = computePositions(lineup.homeTeam.startingXI, true, pW, pH);
  const awayPos = computePositions(lineup.awayTeam.startingXI, false, pW, pH);
  const hasBench = lineup.homeTeam.bench.length > 0 || lineup.awayTeam.bench.length > 0;

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
  const numStripes = 8;

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={[pitchSt.field, { width: pW, height: pH }]}>

        {/* Grass stripes */}
        {Array.from({ length: numStripes }).map((_, i) => (
          <View key={i} style={[pitchSt.stripe, {
            top: i * (pH / numStripes),
            height: pH / numStripes,
            opacity: i % 2 === 0 ? 0.06 : 0,
          }]} />
        ))}

        {/* Outer border */}
        <View style={[pitchSt.line, { top: 10, left: 10, right: 10, height: 1 }]} />
        <View style={[pitchSt.line, { bottom: 10, left: 10, right: 10, height: 1 }]} />
        <View style={[pitchSt.line, { top: 10, left: 10, bottom: 10, width: 1 }]} />
        <View style={[pitchSt.line, { top: 10, right: 10, bottom: 10, width: 1 }]} />

        {/* Center line */}
        <View style={[pitchSt.line, { top: halfH, left: 10, right: 10, height: 1 }]} />

        {/* Center circle */}
        <View style={[pitchSt.centerCircle, { top: halfH - 40, left: pW / 2 - 40 }]} />
        <View style={[pitchSt.dot, { top: halfH - 3, left: pW / 2 - 3 }]} />

        {/* Penalty areas */}
        <View style={[pitchSt.penArea, { top: 10, left: penLeft, width: penW, height: penH }]} />
        <View style={[pitchSt.penArea, { bottom: 10, left: penLeft, width: penW, height: penH }]} />

        {/* Goal areas */}
        <View style={[pitchSt.penArea, { top: 10, left: goalLeft, width: goalW, height: goalH }]} />
        <View style={[pitchSt.penArea, { bottom: 10, left: goalLeft, width: goalW, height: goalH }]} />

        {/* Team + formation labels */}
        <View style={[pitchSt.teamLabel, { top: 14, left: 16 }]}>
          <Text style={pitchSt.teamLabelText} numberOfLines={1}>{homeName.toUpperCase()}</Text>
          {homeFormation ? <Text style={pitchSt.formationText}>{homeFormation}</Text> : null}
        </View>
        <View style={[pitchSt.teamLabel, { bottom: 14, right: 16, alignItems: 'flex-end' }]}>
          <Text style={pitchSt.teamLabelText} numberOfLines={1}>{awayName.toUpperCase()}</Text>
          {awayFormation ? <Text style={pitchSt.formationText}>{awayFormation}</Text> : null}
        </View>

        {/* Players */}
        {homePos.map(({ player, x, y }) => (
          <PlayerDot key={player.id} player={player} x={x} y={y} isHome />
        ))}
        {awayPos.map(({ player, x, y }) => (
          <PlayerDot key={player.id} player={player} x={x} y={y} isHome={false} />
        ))}
      </View>

      {hasBench && <BenchSection homeTeam={lineup.homeTeam} awayTeam={lineup.awayTeam} />}
    </View>
  );
}

function PlayerDot({ player, x, y, isHome }: {
  player: LineupPlayer; x: number; y: number; isHome: boolean;
}) {
  return (
    <View style={[pitchSt.playerWrap, { left: x - WRAP / 2, top: y - CHIP / 2 - 5 }]}>
      <View style={[pitchSt.chipRing, isHome ? pitchSt.chipRingHome : pitchSt.chipRingAway]}>
        <View style={[pitchSt.chip, isHome ? pitchSt.chipHome : pitchSt.chipAway]}>
          <Text style={[pitchSt.chipNum, isHome ? pitchSt.chipNumHome : pitchSt.chipNumAway]}>
            {player.number ?? '?'}
          </Text>
        </View>
      </View>
      <Text style={pitchSt.chipName} numberOfLines={1}>{player.lastName}</Text>
    </View>
  );
}

function BenchSection({ homeTeam, awayTeam }: { homeTeam: TeamLineup; awayTeam: TeamLineup }) {
  const homeName = homeTeam.club.shortName ?? homeTeam.club.name;
  const awayName = awayTeam.club.shortName ?? awayTeam.club.name;
  const maxLen = Math.max(homeTeam.bench.length, awayTeam.bench.length);

  return (
    <View style={pitchSt.benchCard}>
      <View style={pitchSt.benchHeader}>
        <Text style={pitchSt.benchTeamLeft} numberOfLines={1}>{homeName.toUpperCase()}</Text>
        <Text style={pitchSt.benchLabel}>BENCH</Text>
        <Text style={pitchSt.benchTeamRight} numberOfLines={1}>{awayName.toUpperCase()}</Text>
      </View>
      {Array.from({ length: maxLen }).map((_, i) => {
        const hp = homeTeam.bench[i];
        const ap = awayTeam.bench[i];
        return (
          <View key={i} style={[pitchSt.benchRow, i < maxLen - 1 && pitchSt.benchRowBorder]}>
            <View style={pitchSt.benchCell}>
              {hp && <>
                <Text style={pitchSt.benchNum}>{hp.number ?? '—'}</Text>
                <Text style={pitchSt.benchName} numberOfLines={1}>{hp.lastName}</Text>
                <View style={[pitchSt.posBadge, { backgroundColor: POS_COLOR[hp.position ?? ''] ?? '#1A1A1A' }]}>
                  <Text style={pitchSt.posText}>{POS_SHORT[hp.position ?? ''] ?? '—'}</Text>
                </View>
              </>}
            </View>
            <View style={pitchSt.benchDivider} />
            <View style={[pitchSt.benchCell, pitchSt.benchCellRight]}>
              {ap && <>
                <View style={[pitchSt.posBadge, { backgroundColor: POS_COLOR[ap.position ?? ''] ?? '#1A1A1A' }]}>
                  <Text style={pitchSt.posText}>{POS_SHORT[ap.position ?? ''] ?? '—'}</Text>
                </View>
                <Text style={[pitchSt.benchName, { textAlign: 'right' }]} numberOfLines={1}>{ap.lastName}</Text>
                <Text style={pitchSt.benchNum}>{ap.number ?? '—'}</Text>
              </>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/* ── Shared sub-components ───────────────────────────────────── */

function ClubHeroCol({
  name, tla, logoUri, align = 'left',
}: {
  name: string; tla?: string; logoUri?: string | null; align?: 'left' | 'right';
}) {
  return (
    <View style={[styles.clubCol, align === 'right' && styles.clubColRight]}>
      {logoUri ? (
        <Image source={{ uri: logoUri }} style={styles.heroLogo} contentFit="contain" />
      ) : (
        <View style={styles.heroLogoPlaceholder}>
          <Text style={styles.heroLogoInitials}>
            {tla ?? name.slice(0, 3).toUpperCase()}
          </Text>
        </View>
      )}
      <Text style={[styles.clubName, align === 'right' && { textAlign: 'right' }]} numberOfLines={2}>
        {name}
      </Text>
    </View>
  );
}

function InfoRow({
  icon, label, value, last,
}: {
  icon: any; label: string; value: string; last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <View style={styles.infoRowLeft}>
        <Ionicons name={icon} size={15} color="#555555" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}


/* ── Ratings section ─────────────────────────────────────────── */

type PlayerInput = { rating: number | null; best: boolean; worst: boolean };

function RatingsSection({
  matchId, token, lineup, hasReferee,
}: {
  matchId: number;
  token: string;
  lineup: MatchLineup | null;
  hasReferee: boolean;
}) {
  const [communityRatings, setCommunityRatings] = useState<MatchRatings | null>(null);
  const [matchRating, setMatchRating] = useState<number | null>(null);
  const [refereeRating, setRefereeRating] = useState<number | null>(null);
  const [atmosphereRating, setAtmosphereRating] = useState<number | null>(null);
  const [playerInputs, setPlayerInputs] = useState<Record<number, PlayerInput>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMatchRatings(matchId, token).then(setCommunityRatings).catch(() => {});

    getUserRatings(token).then(allRatings => {
      const mine = allRatings.find(r => r.matchId === matchId);
      if (!mine) return;
      if (mine.matchRating) setMatchRating(mine.matchRating.rating);
      if (mine.refereeRating) setRefereeRating(mine.refereeRating.rating);
      if (mine.atmosphereRating) setAtmosphereRating(mine.atmosphereRating.rating);
      if (mine.playerRatings.length > 0) {
        const inputs: Record<number, PlayerInput> = {};
        for (const p of mine.playerRatings) {
          inputs[p.playerId] = { rating: p.rating, best: p.bestPlayer, worst: p.worstPlayer };
        }
        setPlayerInputs(inputs);
      }
    }).catch(() => {});
  }, [matchId, token]);

  function setPlayerRating(playerId: number, rating: number | null) {
    setPlayerInputs(prev => {
      const existing = prev[playerId] ?? { rating: null, best: false, worst: false };
      return { ...prev, [playerId]: { ...existing, rating } };
    });
  }

  function toggleBest(playerId: number) {
    setPlayerInputs(prev => {
      const isNowBest = !(prev[playerId]?.best ?? false);
      const next: Record<number, PlayerInput> = Object.fromEntries(
        Object.entries(prev).map(([id, v]) => [id, { ...v, best: false }])
      );
      const existing = next[playerId] ?? { rating: null, best: false, worst: false };
      next[playerId] = { ...existing, best: isNowBest };
      return next;
    });
  }

  function toggleWorst(playerId: number) {
    setPlayerInputs(prev => {
      const isNowWorst = !(prev[playerId]?.worst ?? false);
      const next: Record<number, PlayerInput> = Object.fromEntries(
        Object.entries(prev).map(([id, v]) => [id, { ...v, worst: false }])
      );
      const existing = next[playerId] ?? { rating: null, best: false, worst: false };
      next[playerId] = { ...existing, worst: isNowWorst };
      return next;
    });
  }

  async function handleSubmit() {
    const hasInput =
      matchRating || refereeRating || atmosphereRating ||
      Object.values(playerInputs).some(p => p.rating || p.best || p.worst);

    if (!hasInput) {
      Alert.alert('No ratings', 'Please select at least one rating before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const promises: Promise<void>[] = [];
      if (matchRating) promises.push(rateMatch(matchId, matchRating, token));
      if (refereeRating && hasReferee) promises.push(rateReferee(matchId, refereeRating, token));
      if (atmosphereRating) promises.push(rateAtmosphere(matchId, atmosphereRating, token));

      const playerRatings = Object.entries(playerInputs)
        .filter(([, v]) => v.rating !== null || v.best || v.worst)
        .map(([id, v]) => ({
          playerId: Number(id),
          rating: v.rating ?? 5,
          bestPlayer: v.best,
          worstPlayer: v.worst,
        }));
      if (playerRatings.length > 0) promises.push(ratePlayers(matchId, playerRatings, token));

      await Promise.all(promises);
      const updated = await getMatchRatings(matchId, token);
      setCommunityRatings(updated);
      Alert.alert('Submitted!', 'Your ratings have been saved.');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to submit ratings.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View>
      <RatingSectionDivider title="RATE THIS MATCH" />

      {communityRatings && (
        <View style={rat.communityCard}>
          <Text style={rat.communityTitle}>Community Averages</Text>
          <CommunityRow label="Match" value={communityRatings.averageMatchRating} />
          {hasReferee && <CommunityRow label="Referee" value={communityRatings.averageRefereeRating} />}
          <CommunityRow label="Atmosphere" value={communityRatings.averageAtmosphereRating} last />
        </View>
      )}

      <View style={rat.inputCard}>
        <NumberPicker label="Match Quality" value={matchRating} onChange={setMatchRating} />
        {hasReferee && <NumberPicker label="Referee" value={refereeRating} onChange={setRefereeRating} />}
        <NumberPicker label="Atmosphere" value={atmosphereRating} onChange={setAtmosphereRating} last />
      </View>

      {lineup && (
        <>
          <RatingSectionDivider title="RATE PLAYERS" />
          <PlayerRatingsInput
            homeTeam={lineup.homeTeam}
            awayTeam={lineup.awayTeam}
            inputs={playerInputs}
            communityRatings={communityRatings?.playerRatings ?? []}
            onRatingChange={setPlayerRating}
            onToggleBest={toggleBest}
            onToggleWorst={toggleWorst}
          />
        </>
      )}

      <TouchableOpacity
        style={[rat.submitBtn, submitting && rat.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting
          ? <ActivityIndicator color="#FFFFFF" size="small" />
          : <Text style={rat.submitText}>Submit Ratings</Text>}
      </TouchableOpacity>
    </View>
  );
}

function RatingSectionDivider({ title }: { title: string }) {
  return (
    <View style={rat.divider}>
      <View style={rat.dividerLine} />
      <Text style={rat.dividerTitle}>{title}</Text>
      <View style={rat.dividerLine} />
    </View>
  );
}

function CommunityRow({ label, value, last }: { label: string; value: number | null | undefined; last?: boolean }) {
  return (
    <View style={[rat.communityRow, !last && rat.communityRowBorder]}>
      <Text style={rat.communityLabel}>{label}</Text>
      <Text style={rat.communityValue}>
        {value != null ? `★ ${value.toFixed(1)}` : '—'}
      </Text>
    </View>
  );
}

function NumberPicker({ label, value, onChange, last }: {
  label: string;
  value: number | null;
  onChange: (n: number) => void;
  last?: boolean;
}) {
  return (
    <View style={[rat.pickerRow, !last && rat.pickerRowBorder]}>
      <Text style={rat.pickerLabel}>{label}</Text>
      <View style={rat.pickerNumbers}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <TouchableOpacity
            key={n}
            style={[rat.numBtn, value === n && rat.numBtnSelected]}
            onPress={() => onChange(n)}
          >
            <Text style={[rat.numText, value === n && rat.numTextSelected]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function PlayerRatingsInput({
  homeTeam, awayTeam, inputs, communityRatings, onRatingChange, onToggleBest, onToggleWorst,
}: {
  homeTeam: TeamLineup;
  awayTeam: TeamLineup;
  inputs: Record<number, PlayerInput>;
  communityRatings: PlayerRatingResult[];
  onRatingChange: (id: number, rating: number | null) => void;
  onToggleBest: (id: number) => void;
  onToggleWorst: (id: number) => void;
}) {
  const communityMap = new Map(communityRatings.map(p => [p.playerId, p]));

  function renderTeam(team: TeamLineup) {
    const players = [...team.startingXI, ...team.bench];
    const teamName = team.club.shortName ?? team.club.name;
    return (
      <View key={team.club.id} style={rat.playerTeamBlock}>
        <Text style={rat.playerTeamName}>{teamName.toUpperCase()}</Text>
        <View style={rat.playerCard}>
          {players.map((p, i) => (
            <PlayerRatingRow
              key={p.id}
              player={p}
              input={inputs[p.id]}
              communityRating={communityMap.get(p.id)}
              last={i === players.length - 1}
              onRatingChange={r => onRatingChange(p.id, r)}
              onToggleBest={() => onToggleBest(p.id)}
              onToggleWorst={() => onToggleWorst(p.id)}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View>
      {renderTeam(homeTeam)}
      {renderTeam(awayTeam)}
    </View>
  );
}

function PlayerRatingRow({
  player, input, communityRating, last, onRatingChange, onToggleBest, onToggleWorst,
}: {
  player: LineupPlayer;
  input: PlayerInput | undefined;
  communityRating: PlayerRatingResult | undefined;
  last: boolean;
  onRatingChange: (rating: number | null) => void;
  onToggleBest: () => void;
  onToggleWorst: () => void;
}) {
  const pos = POS_SHORT[player.position ?? ''] ?? (player.position?.slice(0, 2).toUpperCase() ?? '—');
  const posColor = POS_COLOR[player.position ?? ''] ?? '#1A1A1A';

  return (
    <View style={[pr.row, !last && pr.rowBorder]}>
      <View style={pr.nameRow}>
        <Text style={pr.number}>{player.number ?? '—'}</Text>
        <View style={[pr.posBadge, { backgroundColor: posColor }]}>
          <Text style={pr.posText}>{pos}</Text>
        </View>
        <Text style={pr.name} numberOfLines={1}>{player.lastName}</Text>
        {communityRating?.averageRating != null && (
          <Text style={pr.avg}>avg {communityRating.averageRating.toFixed(1)}</Text>
        )}
      </View>
      <View style={pr.ratingRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <TouchableOpacity
            key={n}
            style={[pr.numBtn, input?.rating === n && pr.numBtnSelected]}
            onPress={() => onRatingChange(input?.rating === n ? null : n)}
          >
            <Text style={[pr.numText, input?.rating === n && pr.numTextSelected]}>{n}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[pr.toggleBtn, input?.best && pr.toggleBtnBest]}
          onPress={onToggleBest}
        >
          <Text style={pr.toggleText}>★</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[pr.toggleBtn, input?.worst && pr.toggleBtnWorst]}
          onPress={onToggleWorst}
        >
          <Text style={pr.toggleText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { padding: 20, paddingBottom: 48 },
  centered: {
    flex: 1, backgroundColor: '#000000',
    justifyContent: 'center', alignItems: 'center',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  errorText: { color: '#666666', fontSize: 16 },

  hero: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 20, gap: 8,
  },
  clubCol: { flex: 1, alignItems: 'flex-start', gap: 8 },
  clubColRight: { alignItems: 'flex-end' },
  heroLogo: { width: 54, height: 54 },
  heroLogoPlaceholder: {
    width: 54, height: 54, borderRadius: 10,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center',
  },
  heroLogoInitials: { fontSize: 13, fontWeight: '800', color: '#444444' },
  clubName: { fontSize: 12, fontWeight: '700', color: '#CCCCCC' },

  centreBox: { alignItems: 'center', gap: 6, minWidth: 76 },
  scoreText: { fontSize: 30, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  vsText: { fontSize: 20, fontWeight: '700', color: '#333333' },
  ftBadge: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6,
    backgroundColor: '#1A1A1A',
  },
  ftText: { fontSize: 11, fontWeight: '700', color: '#888888' },
  upcomingBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: '#0D1A00',
  },
  upcomingBadgeText: { fontSize: 11, fontWeight: '700', color: '#4A8A2A' },

  infoCard: {
    backgroundColor: '#111111', borderRadius: 12,
    borderWidth: 1, borderColor: '#1E1E1E',
    marginBottom: 20, overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  infoRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { fontSize: 14, color: '#666666' },
  infoValue: { fontSize: 14, color: '#FFFFFF', maxWidth: '55%', textAlign: 'right' },

  noLineup: { alignItems: 'center', paddingTop: 24 },
  noLineupText: { color: '#333333', fontSize: 13 },
});

const pitchSt = StyleSheet.create({
  field: {
    backgroundColor: '#1E7022',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  stripe: {
    position: 'absolute', left: 0, right: 0,
    backgroundColor: '#000000',
  },
  line: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  centerCircle: {
    position: 'absolute',
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.28)',
  },
  dot: {
    position: 'absolute',
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  penArea: {
    position: 'absolute',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'transparent',
  },

  teamLabel: { position: 'absolute' },
  teamLabelText: {
    fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.8,
  },
  formationText: {
    fontSize: 11, fontWeight: '900', color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.5, marginTop: 1,
  },

  playerWrap: {
    position: 'absolute',
    width: WRAP,
    alignItems: 'center',
  },
  chipRing: {
    width: CHIP + 4, height: CHIP + 4, borderRadius: (CHIP + 4) / 2,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 4, elevation: 5,
  },
  chipRingHome: { backgroundColor: 'rgba(255,255,255,0.25)' },
  chipRingAway: { backgroundColor: 'rgba(180,0,0,0.35)' },
  chip: {
    width: CHIP, height: CHIP, borderRadius: CHIP / 2,
    justifyContent: 'center', alignItems: 'center',
  },
  chipHome: { backgroundColor: '#FFFFFF' },
  chipAway: { backgroundColor: '#CC0000' },
  chipNum: { fontSize: 11, fontWeight: '800' },
  chipNumHome: { color: '#111111' },
  chipNumAway: { color: '#FFFFFF' },
  chipName: {
    fontSize: 8, fontWeight: '700', color: '#FFFFFF',
    textAlign: 'center', marginTop: 3, maxWidth: WRAP,
    textShadowColor: 'rgba(0,0,0,0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  benchCard: {
    backgroundColor: '#0F0F0F', borderRadius: 12,
    borderWidth: 1, borderColor: '#222222',
    overflow: 'hidden', marginBottom: 20,
  },
  benchHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#1A1A1A',
    backgroundColor: '#080808',
  },
  benchTeamLeft: {
    flex: 1, fontSize: 10, fontWeight: '800', color: '#CC0000', letterSpacing: 0.8,
  },
  benchTeamRight: {
    flex: 1, fontSize: 10, fontWeight: '800', color: '#CC0000',
    letterSpacing: 0.8, textAlign: 'right',
  },
  benchLabel: {
    fontSize: 9, fontWeight: '800', color: '#333333',
    letterSpacing: 1.5, marginHorizontal: 10,
  },
  benchRow: { flexDirection: 'row', alignItems: 'stretch' },
  benchRowBorder: { borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  benchCell: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 9, gap: 5,
  },
  benchCellRight: { justifyContent: 'flex-end' },
  benchDivider: { width: 1, backgroundColor: '#1E1E1E', alignSelf: 'stretch' },
  benchNum: {
    width: 18, fontSize: 10, fontWeight: '700',
    color: '#3A3A3A', textAlign: 'center',
  },
  benchName: { flex: 1, fontSize: 12, fontWeight: '500', color: '#BBBBBB' },
  posBadge: {
    width: 24, height: 17, borderRadius: 4,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  posText: { fontSize: 8, fontWeight: '800', color: '#AAAAAA' },
});

const rat = StyleSheet.create({
  divider: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginTop: 8, marginBottom: 16,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1E1E1E' },
  dividerTitle: {
    fontSize: 10, fontWeight: '800', color: '#444444', letterSpacing: 1.2,
  },

  communityCard: {
    backgroundColor: '#111111', borderRadius: 12,
    borderWidth: 1, borderColor: '#1E1E1E',
    overflow: 'hidden', marginBottom: 12,
  },
  communityTitle: {
    fontSize: 11, fontWeight: '700', color: '#555555',
    paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6,
    letterSpacing: 0.5,
  },
  communityRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  communityRowBorder: { borderTopWidth: 1, borderTopColor: '#1A1A1A' },
  communityLabel: { fontSize: 13, color: '#888888' },
  communityValue: { fontSize: 13, fontWeight: '700', color: '#CC0000' },

  inputCard: {
    backgroundColor: '#111111', borderRadius: 12,
    borderWidth: 1, borderColor: '#1E1E1E',
    overflow: 'hidden', marginBottom: 12,
  },
  pickerRow: {
    paddingHorizontal: 14, paddingVertical: 10,
  },
  pickerRowBorder: { borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  pickerLabel: { fontSize: 13, color: '#888888', marginBottom: 8 },
  pickerNumbers: { flexDirection: 'row', gap: 4 },
  numBtn: {
    width: 27, height: 27, borderRadius: 6,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center',
  },
  numBtnSelected: { backgroundColor: '#CC0000' },
  numText: { fontSize: 11, fontWeight: '700', color: '#555555' },
  numTextSelected: { color: '#FFFFFF' },

  playerTeamBlock: { marginBottom: 16 },
  playerTeamName: {
    fontSize: 10, fontWeight: '800', color: '#CC0000',
    letterSpacing: 1, marginBottom: 6,
  },
  playerCard: {
    backgroundColor: '#111111', borderRadius: 12,
    borderWidth: 1, borderColor: '#1E1E1E',
    overflow: 'hidden',
  },

  submitBtn: {
    backgroundColor: '#CC0000', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center',
    marginTop: 4, marginBottom: 20,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
});

const pr = StyleSheet.create({
  row: { paddingHorizontal: 10, paddingVertical: 8 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  number: { width: 18, fontSize: 10, fontWeight: '700', color: '#444444', textAlign: 'center' },
  posBadge: {
    width: 22, height: 16, borderRadius: 3,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  posText: { fontSize: 8, fontWeight: '800', color: '#AAAAAA' },
  name: { flex: 1, fontSize: 12, fontWeight: '500', color: '#CCCCCC' },
  avg: { fontSize: 10, color: '#555555' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  numBtn: {
    width: 22, height: 22, borderRadius: 4,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center',
  },
  numBtnSelected: { backgroundColor: '#CC0000' },
  numText: { fontSize: 9, fontWeight: '700', color: '#555555' },
  numTextSelected: { color: '#FFFFFF' },
  toggleBtn: {
    width: 26, height: 22, borderRadius: 4,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 4,
  },
  toggleBtnBest: { backgroundColor: '#2A4A00' },
  toggleBtnWorst: { backgroundColor: '#4A0000' },
  toggleText: { fontSize: 11, color: '#666666' },
});
