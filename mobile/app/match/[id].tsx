import { T } from "@/constants/theme";
import {
  Club,
  LineupPlayer,
  Match,
  MatchComment,
  MatchLineup,
  MatchRatings,
  TeamLineup,
  useAuth,
} from "@/context/auth";
import {
  getMatch,
  getMatchLineup,
  getMatchRatings,
  rateAtmosphere,
  rateMatch,
  ratePlayers,
  rateReferee,
} from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ── helpers ─────────────────────────────────────────────── */

const POS_SHORT: Record<string, string> = {
  Goalkeeper: "GK",
  Defender: "DF",
  Midfielder: "MF",
  Attacker: "FW",
};

function dateStr(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function scoreColorFor(a: number, b: number) {
  if (a === b) return T.draw;
  return a > b ? T.win : T.loss;
}

/* ── ClubLogo ─────────────────────────────────────────────── */

function ClubLogo({ club, size = 56 }: { club: Club; size?: number }) {
  const uri = club.crest ?? club.logoUrl;
  const tla = club.tla ?? club.name.slice(0, 3).toUpperCase();
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
    );
  }
  return (
    <View
      style={[
        logo.placeholder,
        { width: size, height: size, borderRadius: size * 0.2 },
      ]}
    >
      <Text style={[logo.tla, { fontSize: size * 0.28 }]}>{tla}</Text>
    </View>
  );
}

const logo = StyleSheet.create({
  placeholder: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.hairline,
    justifyContent: "center",
    alignItems: "center",
  },
  tla: { color: T.textFaint, fontWeight: "800", letterSpacing: 0.5 },
});

/* ── Tab bar ──────────────────────────────────────────────── */

type TabId = "buzz" | "firstxi" | "stats";

function TabBar({
  active,
  onPress,
}: {
  active: TabId;
  onPress: (t: TabId) => void;
}) {
  const tabs: { id: TabId; label: string }[] = [
    { id: "buzz", label: "Buzz" },
    { id: "firstxi", label: "First XI" },
    { id: "stats", label: "Stats" },
  ];
  return (
    <View style={tb.bar}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <TouchableOpacity
            key={t.id}
            style={[tb.tab, on && tb.tabActive]}
            onPress={() => onPress(t.id)}
            activeOpacity={0.7}
          >
            <Text style={[tb.label, on && tb.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tb = StyleSheet.create({
  bar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 4,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  tabActive: {
    backgroundColor: T.text,
  },
  label: { fontSize: 13, fontWeight: "700", color: T.textDim },
  labelActive: { color: T.bg },
});

/* ── BuzzTab ──────────────────────────────────────────────── */

function CommentCard({ item }: { item: MatchComment }) {
  const date = new Date(item.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  const ratingColor =
    item.rating >= 7 ? T.win : item.rating >= 5 ? T.text : T.loss;

  return (
    <View style={bz.commentCard}>
      <View style={bz.commentHeader}>
        <View style={bz.commentAvatar}>
          <Text style={bz.commentAvatarText}>
            {item.username[0].toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={bz.commentUsername}>{item.username}</Text>
          <Text style={bz.commentDate}>{date}</Text>
        </View>
        <View style={[bz.commentBadge, { borderColor: ratingColor }]}>
          <Text style={[bz.commentBadgeText, { color: ratingColor }]}>
            {item.rating}
          </Text>
        </View>
      </View>
      <Text style={bz.commentText}>{item.comment}</Text>
    </View>
  );
}

function BuzzTab({
  ratings,
  motmName,
}: {
  ratings: MatchRatings | null;
  motmName?: string;
}) {
  const comments = ratings?.comments ?? [];

  return (
    <View style={bz.wrap}>
      {/* Community at-a-glance */}
      {ratings && (
        <View style={bz.statsCard}>
          <View style={bz.statItem}>
            <Text style={bz.statLabel}>COMMUNITY</Text>
            <View style={bz.statValueRow}>
              {ratings.averageMatchRating != null ? (
                <Text style={bz.statBig}>
                  {ratings.averageMatchRating.toFixed(1)}
                </Text>
              ) : (
                <Text style={bz.statBig}>—</Text>
              )}
              <Text style={bz.statUnit}>/ 10</Text>
            </View>
            <Text style={bz.statVotes}>{ratings.matchCount} votes</Text>
          </View>

          <View style={bz.statDivider} />

          <View style={bz.statItem}>
            <Text style={bz.statLabel}>ATMOS</Text>
            {ratings.averageAtmosphereRating != null ? (
              <Text style={bz.statMid}>
                {ratings.averageAtmosphereRating.toFixed(1)}
              </Text>
            ) : (
              <Text style={bz.statMid}>—</Text>
            )}
            <Text style={bz.statVotes}>{ratings.atmosphereCount}</Text>
          </View>

          <View style={bz.statDivider} />

          <View style={bz.statItem}>
            <Text style={bz.statLabel}>REF</Text>
            {ratings.averageRefereeRating != null ? (
              <Text style={bz.statMid}>
                {ratings.averageRefereeRating.toFixed(1)}
              </Text>
            ) : (
              <Text style={bz.statMid}>—</Text>
            )}
            <Text style={bz.statVotes}>{ratings.refereeCount}</Text>
          </View>

          {motmName && (
            <>
              <View style={bz.statDivider} />
              <View style={bz.statItem}>
                <Text style={bz.statLabel}>MOTM</Text>
                <Text
                  style={[bz.statMid, { color: T.red, fontSize: 12 }]}
                  numberOfLines={1}
                >
                  {motmName}
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Comments */}
      {comments.length > 0 ? (
        <View style={bz.commentsSection}>
          <Text style={bz.commentsSectionTitle}>COMMUNITY TAKES</Text>
          {comments.map((c, i) => (
            <CommentCard key={i} item={c} />
          ))}
        </View>
      ) : (
        <View style={bz.takesPlaceholder}>
          <Ionicons name="chatbubble-outline" size={32} color={T.textFaint} />
          <Text style={bz.takesTitle}>Community takes</Text>
          <Text style={bz.takesSub}>Be the first to leave a comment.</Text>
        </View>
      )}
    </View>
  );
}

const bz = StyleSheet.create({
  wrap: { paddingHorizontal: 20 },
  statsCard: {
    backgroundColor: T.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.hairline,
    flexDirection: "row",
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: T.textFaint,
    letterSpacing: 0.8,
  },
  statValueRow: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  statBig: {
    fontSize: 28,
    fontWeight: "900",
    color: T.text,
    letterSpacing: -1,
  },
  statUnit: { fontSize: 12, color: T.textFaint },
  statMid: {
    fontSize: 18,
    fontWeight: "800",
    color: T.text,
    letterSpacing: -0.5,
  },
  statVotes: { fontSize: 9, color: T.textFaint, marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: T.hairline },

  takesPlaceholder: {
    alignItems: "center",
    paddingVertical: 36,
    gap: 10,
    backgroundColor: T.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.hairline,
  },
  takesTitle: { fontSize: 16, fontWeight: "700", color: T.text },
  takesSub: { fontSize: 13, color: T.textDim, textAlign: "center" },

  commentsSection: { gap: 10 },
  commentsSectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: T.textFaint,
    letterSpacing: 1,
    marginBottom: 2,
  },
  commentCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.hairline,
    padding: 14,
    gap: 10,
  },
  commentHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.surfaceHi,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: T.hairline,
  },
  commentAvatarText: { fontSize: 13, fontWeight: "800", color: T.text },
  commentUsername: { fontSize: 13, fontWeight: "700", color: T.text },
  commentDate: { fontSize: 11, color: T.textFaint, marginTop: 1 },
  commentBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  commentBadgeText: { fontSize: 14, fontWeight: "900" },
  commentText: { fontSize: 14, color: T.textDim, lineHeight: 20 },
});

/* ── PitchView ────────────────────────────────────────────── */

function posToRow(position: string | undefined): number {
  if (!position) return 3;
  if (position === "Goalkeeper") return 1;
  if (position === "Defender") return 2;
  if (position === "Midfielder") return 3;
  return 4;
}

function computeFormation(players: LineupPlayer[]): string {
  const rowMap = new Map<number, number>();
  for (const p of players) {
    const row = p.grid
      ? parseInt(p.grid.split(":")[0], 10)
      : posToRow(p.position);
    rowMap.set(row, (rowMap.get(row) ?? 0) + 1);
  }
  const rows = Array.from(rowMap.keys()).sort((a, b) => a - b);
  return rows
    .slice(1)
    .map((r) => rowMap.get(r)!)
    .join("-");
}

function computePositions(
  players: LineupPlayer[],
  isHome: boolean,
  pW: number,
  pH: number,
): { player: LineupPlayer; x: number; y: number }[] {
  const rowMap = new Map<number, LineupPlayer[]>();
  for (const p of players) {
    const row = p.grid
      ? parseInt(p.grid.split(":")[0], 10)
      : posToRow(p.position);
    if (!rowMap.has(row)) rowMap.set(row, []);
    rowMap.get(row)!.push(p);
  }
  const sortedRows = Array.from(rowMap.keys()).sort((a, b) => a - b);
  const numRows = sortedRows.length;
  const halfH = pH / 2;
  const padEdge = 34,
    padCenter = 20;

  return sortedRows.flatMap((row, rowIndex) => {
    const rowPlayers = rowMap.get(row)!.sort((a, b) => {
      const colA = a.grid ? parseInt(a.grid.split(":")[1], 10) : 0;
      const colB = b.grid ? parseInt(b.grid.split(":")[1], 10) : 0;
      return colA - colB;
    });
    const n = rowPlayers.length;
    const frac = rowIndex / Math.max(numRows - 1, 1);
    const y = isHome
      ? padEdge + frac * (halfH - padEdge - padCenter)
      : pH - padEdge - frac * (halfH - padEdge - padCenter);
    return rowPlayers.map((player, i) => ({
      player,
      x: ((i + 1) / (n + 1)) * pW,
      y,
    }));
  });
}

const CHIP = 30;
const WRAP = 46;

function PlayerDot({
  player,
  x,
  y,
  isHome,
  selected,
  onSelect,
}: {
  player: LineupPlayer;
  x: number;
  y: number;
  isHome: boolean;
  selected?: boolean;
  onSelect?: (p: LineupPlayer) => void;
}) {
  return (
    <TouchableOpacity
      style={[ps.playerWrap, { left: x - WRAP / 2, top: y - CHIP / 2 - 5 }]}
      onPress={() => onSelect?.(player)}
      activeOpacity={onSelect ? 0.7 : 1}
      disabled={!onSelect}
    >
      <View
        style={[
          ps.chipRing,
          isHome ? ps.chipRingHome : ps.chipRingAway,
          selected && ps.chipRingSelected,
        ]}
      >
        <View
          style={[
            ps.chip,
            isHome ? ps.chipHome : ps.chipAway,
            selected && ps.chipSelected,
          ]}
        >
          <Text style={[ps.chipNum, isHome ? ps.chipNumHome : ps.chipNumAway]}>
            {player.number ?? "?"}
          </Text>
        </View>
      </View>
      <Text style={ps.chipName} numberOfLines={1}>
        {player.lastName}
      </Text>
    </TouchableOpacity>
  );
}

const ps = StyleSheet.create({
  playerWrap: { position: "absolute", width: WRAP, alignItems: "center" },
  chipRing: {
    width: CHIP + 4,
    height: CHIP + 4,
    borderRadius: (CHIP + 4) / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },
  chipRingHome: { backgroundColor: "rgba(255,255,255,0.2)" },
  chipRingAway: { backgroundColor: "rgba(180,0,0,0.3)" },
  chipRingSelected: { backgroundColor: "rgba(225,29,42,0.4)" },
  chip: {
    width: CHIP,
    height: CHIP,
    borderRadius: CHIP / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  chipHome: { backgroundColor: "#FFFFFF" },
  chipAway: { backgroundColor: "#CC0000" },
  chipSelected: { backgroundColor: T.red },
  chipNum: { fontSize: 11, fontWeight: "800" },
  chipNumHome: { color: "#111111" },
  chipNumAway: { color: "#FFFFFF" },
  chipName: {
    fontSize: 8,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginTop: 3,
    maxWidth: WRAP,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

function PitchView({
  lineup,
  selectable,
  selected,
  onSelect,
}: {
  lineup: MatchLineup;
  selectable?: boolean;
  selected?: number | null;
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
      <View style={[pitch.field, { width: pW, height: pH }]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={i}
            style={[
              pitch.stripe,
              {
                top: i * (pH / 8),
                height: pH / 8,
                opacity: i % 2 === 0 ? 0.07 : 0,
              },
            ]}
          />
        ))}
        <View
          style={[pitch.line, { top: 10, left: 10, right: 10, height: 1 }]}
        />
        <View
          style={[pitch.line, { bottom: 10, left: 10, right: 10, height: 1 }]}
        />
        <View
          style={[pitch.line, { top: 10, left: 10, bottom: 10, width: 1 }]}
        />
        <View
          style={[pitch.line, { top: 10, right: 10, bottom: 10, width: 1 }]}
        />
        <View
          style={[pitch.line, { top: halfH, left: 10, right: 10, height: 1 }]}
        />
        <View
          style={[pitch.centerCircle, { top: halfH - 40, left: pW / 2 - 40 }]}
        />
        <View style={[pitch.dot, { top: halfH - 3, left: pW / 2 - 3 }]} />
        <View
          style={[
            pitch.penArea,
            { top: 10, left: penLeft, width: penW, height: penH },
          ]}
        />
        <View
          style={[
            pitch.penArea,
            { bottom: 10, left: penLeft, width: penW, height: penH },
          ]}
        />
        <View
          style={[
            pitch.penArea,
            { top: 10, left: goalLeft, width: goalW, height: goalH },
          ]}
        />
        <View
          style={[
            pitch.penArea,
            { bottom: 10, left: goalLeft, width: goalW, height: goalH },
          ]}
        />

        <View style={[pitch.teamLabel, { top: 14, left: 16 }]}>
          <Text style={pitch.teamLabelText} numberOfLines={1}>
            {homeName.toUpperCase()}
          </Text>
          {homeFormation ? (
            <Text style={pitch.formationText}>{homeFormation}</Text>
          ) : null}
        </View>
        <View
          style={[
            pitch.teamLabel,
            { bottom: 14, right: 16, alignItems: "flex-end" },
          ]}
        >
          <Text style={pitch.teamLabelText} numberOfLines={1}>
            {awayName.toUpperCase()}
          </Text>
          {awayFormation ? (
            <Text style={pitch.formationText}>{awayFormation}</Text>
          ) : null}
        </View>

        {homePos.map(({ player, x, y }) => (
          <PlayerDot
            key={player.id}
            player={player}
            x={x}
            y={y}
            isHome
            selected={selected === player.id}
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
            onSelect={selectable ? onSelect : undefined}
          />
        ))}
      </View>
    </View>
  );
}

const pitch = StyleSheet.create({
  field: {
    backgroundColor: "#1A6B20",
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  stripe: { position: "absolute", left: 0, right: 0, backgroundColor: "#000" },
  line: { position: "absolute", backgroundColor: "rgba(255,255,255,0.25)" },
  centerCircle: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
  },
  dot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  penArea: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "transparent",
  },
  teamLabel: { position: "absolute" },
  teamLabelText: {
    fontSize: 9,
    fontWeight: "800",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.8,
  },
  formationText: {
    fontSize: 11,
    fontWeight: "900",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.5,
    marginTop: 1,
  },
  playerWrap: { position: "absolute", width: WRAP, alignItems: "center" },
});

/* ── BenchSection ─────────────────────────────────────────── */

function BenchSection({
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
    <View style={bench.card}>
      <View style={bench.header}>
        <Text style={bench.teamLeft}>{homeName.toUpperCase()}</Text>
        <Text style={bench.label}>BENCH</Text>
        <Text style={bench.teamRight}>{awayName.toUpperCase()}</Text>
      </View>
      {Array.from({ length: maxLen }).map((_, i) => {
        const hp = homeTeam.bench[i];
        const ap = awayTeam.bench[i];
        return (
          <View key={i} style={[bench.row, i < maxLen - 1 && bench.rowBorder]}>
            <View style={bench.cell}>
              {hp && (
                <>
                  <Text style={bench.num}>{hp.number ?? "—"}</Text>
                  <Text style={bench.name} numberOfLines={1}>
                    {hp.lastName}
                  </Text>
                  <View style={bench.posBadge}>
                    <Text style={bench.posText}>
                      {POS_SHORT[hp.position ?? ""] ?? "—"}
                    </Text>
                  </View>
                </>
              )}
            </View>
            <View style={bench.divider} />
            <View style={[bench.cell, bench.cellRight]}>
              {ap && (
                <>
                  <View style={bench.posBadge}>
                    <Text style={bench.posText}>
                      {POS_SHORT[ap.position ?? ""] ?? "—"}
                    </Text>
                  </View>
                  <Text
                    style={[bench.name, { textAlign: "right" }]}
                    numberOfLines={1}
                  >
                    {ap.lastName}
                  </Text>
                  <Text style={bench.num}>{ap.number ?? "—"}</Text>
                </>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const bench = StyleSheet.create({
  card: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.hairline,
    overflow: "hidden",
    marginBottom: 20,
    marginHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: T.hairline,
    backgroundColor: T.surfaceHi,
  },
  teamLeft: {
    flex: 1,
    fontSize: 10,
    fontWeight: "800",
    color: T.red,
    letterSpacing: 0.8,
  },
  teamRight: {
    flex: 1,
    fontSize: 10,
    fontWeight: "800",
    color: T.red,
    letterSpacing: 0.8,
    textAlign: "right",
  },
  label: {
    fontSize: 9,
    fontWeight: "800",
    color: T.textFaint,
    letterSpacing: 1.5,
    marginHorizontal: 10,
  },
  row: { flexDirection: "row", alignItems: "stretch" },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: T.hairline },
  cell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 5,
  },
  cellRight: { justifyContent: "flex-end" },
  divider: { width: 1, backgroundColor: T.hairline, alignSelf: "stretch" },
  num: {
    width: 18,
    fontSize: 10,
    fontWeight: "700",
    color: T.textFaint,
    textAlign: "center",
  },
  name: { flex: 1, fontSize: 12, fontWeight: "500", color: T.text },
  posBadge: {
    width: 26,
    height: 18,
    borderRadius: 5,
    backgroundColor: T.surfaceHi,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: T.hairline,
    flexShrink: 0,
  },
  posText: { fontSize: 8, fontWeight: "800", color: T.textFaint },
});

/* ── Rating slider (used in card step 1 drag fallback) ────── */

function RatingSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const trackWidthRef = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderGrant: (e) => {
        const w = trackWidthRef.current;
        if (w > 0) {
          const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / w));
          onChangeRef.current(
            Math.max(1, Math.min(10, Math.round(1 + pct * 9))),
          );
        }
      },
      onPanResponderMove: (e) => {
        const w = trackWidthRef.current;
        if (w > 0) {
          const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / w));
          onChangeRef.current(
            Math.max(1, Math.min(10, Math.round(1 + pct * 9))),
          );
        }
      },
    }),
  ).current;

  const pct = (value - 1) / 9;
  const THUMB = 24;

  return (
    <View
      onLayout={(e) => {
        trackWidthRef.current = e.nativeEvent.layout.width;
      }}
      {...panResponder.panHandlers}
      style={{ height: 44, justifyContent: "center" }}
    >
      <View
        style={{ height: 5, backgroundColor: T.surfaceHi, borderRadius: 3 }}
      >
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pct * 100}%` as any,
            backgroundColor: T.red,
            borderRadius: 3,
          }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          left: `${pct * 100}%` as any,
          top: (44 - THUMB) / 2,
          width: THUMB,
          height: THUMB,
          borderRadius: THUMB / 2,
          backgroundColor: T.red,
          transform: [{ translateX: -(THUMB / 2) }],
          elevation: 4,
          shadowColor: T.red,
          shadowOpacity: 0.5,
          shadowRadius: 6,
        }}
      />
    </View>
  );
}

/* ── StarRow ──────────────────────────────────────────────── */

function StarRow({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub?: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <View style={sr.wrap}>
      <View style={sr.top}>
        <View>
          <Text style={sr.label}>{label}</Text>
          {sub && <Text style={sr.sub}>{sub}</Text>}
        </View>
        <Text style={sr.count}>{value > 0 ? `${value}.0` : "—"}</Text>
      </View>
      <View style={sr.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity
            key={i}
            style={[sr.starBtn, i <= value && sr.starBtnActive]}
            onPress={() => onChange(value === i ? 0 : i)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={i <= value ? "star" : "star-outline"}
              size={18}
              color={i <= value ? "#F5A524" : T.textFaint}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const sr = StyleSheet.create({
  wrap: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.hairline,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  label: { fontSize: 14, fontWeight: "700", color: T.text },
  sub: { fontSize: 11, color: T.textFaint, marginTop: 2 },
  count: { fontSize: 13, color: T.textFaint, fontWeight: "600" },
  stars: { flexDirection: "row", gap: 6 },
  starBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: T.hairline,
    backgroundColor: "transparent",
  },
  starBtnActive: {
    backgroundColor: "rgba(245,165,36,0.10)",
    borderColor: "rgba(245,165,36,0.35)",
  },
});

/* ── Card stack rating modal ──────────────────────────────── */

type RateStep = 1 | 2 | 3 | 4;

type PlayerWithClub = LineupPlayer & { isHome: boolean };

function RateModal({
  visible,
  onClose,
  matchId,
  token,
  lineup,
  hasReferee,
  refereeLabel,
  onDone,
}: {
  visible: boolean;
  onClose: () => void;
  matchId: number;
  token: string;
  lineup: MatchLineup | null;
  hasReferee: boolean;
  refereeLabel?: string;
  onDone: (ratings: MatchRatings) => void;
}) {
  const [step, setStep] = useState<RateStep>(1);
  const [matchRating, setMatchRating] = useState(7);
  const [atmosphereStars, setAtmosphereStars] = useState(0);
  const [refereeStars, setRefereeStars] = useState(0);
  const [motmPlayerId, setMotmPlayerId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allPlayers: PlayerWithClub[] = lineup
    ? [
        ...lineup.homeTeam.startingXI.map((p) => ({ ...p, isHome: true })),
        ...lineup.awayTeam.startingXI.map((p) => ({ ...p, isHome: false })),
      ]
    : [];

  const selectedPlayer = allPlayers.find((p) => p.id === motmPlayerId);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const promises: Promise<void>[] = [];
      promises.push(rateMatch(matchId, matchRating, token));
      if (atmosphereStars > 0)
        promises.push(rateAtmosphere(matchId, atmosphereStars * 2, token));
      if (refereeStars > 0 && hasReferee)
        promises.push(rateReferee(matchId, refereeStars * 2, token));
      if (motmPlayerId) {
        promises.push(
          ratePlayers(
            matchId,
            [
              {
                playerId: motmPlayerId,
                rating: 10,
                bestPlayer: true,
                worstPlayer: false,
              },
            ],
            token,
          ),
        );
      }
      await Promise.all(promises);
      const updated = await getMatchRatings(matchId, token);
      onDone({
        averageMatchRating: updated.averageMatchRating ?? matchRating,
        averageAtmosphereRating:
          updated.averageAtmosphereRating ??
          (atmosphereStars > 0 ? atmosphereStars * 2 : null),
        averageRefereeRating:
          updated.averageRefereeRating ??
          (refereeStars > 0 ? refereeStars * 2 : null),
        matchCount: updated.matchCount ?? 1,
        refereeCount: updated.refereeCount ?? 0,
        atmosphereCount: updated.atmosphereCount ?? 0,
        playerRatings: updated.playerRatings,
        comments: updated.comments ?? [],
        userMatchRating: updated.userMatchRating ?? matchRating,
      });
      onClose();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to submit ratings.");
    } finally {
      setSubmitting(false);
    }
  }

  const matchLabel =
    matchRating >= 9
      ? "Exceptional"
      : matchRating >= 7
        ? "Solid · enjoyable"
        : matchRating >= 5
          ? "Average"
          : matchRating >= 3
            ? "Disappointing"
            : "Unwatchable";
  const matchColor =
    matchRating >= 7 ? T.win : matchRating >= 5 ? T.text : T.loss;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={rm.container}>
        {/* Header */}
        <View style={rm.header}>
          <TouchableOpacity
            onPress={onClose}
            style={rm.closeBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={T.text} />
          </TouchableOpacity>
          {/* Progress */}
          <View style={rm.progress}>
            {([1, 2, 3, 4] as RateStep[]).map((i) => (
              <View
                key={i}
                style={[rm.progressBar, i <= step && rm.progressBarActive]}
              />
            ))}
          </View>
          <Text style={rm.stepCount}>{step}/4</Text>
        </View>

        <ScrollView
          contentContainerStyle={rm.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Peek cards */}
          <View style={rm.peekOuter} />
          <View style={rm.peekInner} />

          {/* Front card */}
          <View style={rm.card}>
            {step === 1 && (
              <View>
                <Text style={rm.stepLabel}>STEP 1 · MATCH OVERALL</Text>
                <Text style={rm.cardTitle}>How was the game?</Text>
                <Text style={rm.cardSub}>
                  Tap a number — you can change it later.
                </Text>

                {/* Big number */}
                <View style={rm.bigNumWrap}>
                  <Text style={[rm.bigNum, { color: matchColor }]}>
                    {matchRating}
                  </Text>
                  <Text style={rm.bigNumLabel}>{matchLabel}</Text>
                </View>

                {/* 10 chips */}
                <View style={rm.chips}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
                    const on = n === matchRating;
                    const c = n >= 7 ? T.win : n >= 5 ? T.text : T.loss;
                    return (
                      <TouchableOpacity
                        key={n}
                        style={[
                          rm.chip,
                          on && { backgroundColor: c, borderColor: c },
                        ]}
                        onPress={() => setMatchRating(n)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            rm.chipText,
                            on && { color: "#fff" },
                            !on && { color: T.textDim },
                          ]}
                        >
                          {n}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={rm.stepLabel}>
                  STEP 2 · ATMOSPHERE &amp; REFEREE
                </Text>
                <Text style={rm.cardTitle}>Vibe and whistle.</Text>

                <View style={{ marginTop: 8 }}>
                  <StarRow
                    label="Atmosphere"
                    sub="Crowd, tifo, energy"
                    value={atmosphereStars}
                    onChange={setAtmosphereStars}
                  />
                  {hasReferee && (
                    <StarRow
                      label="Referee"
                      sub={refereeLabel}
                      value={refereeStars}
                      onChange={setRefereeStars}
                    />
                  )}
                </View>
              </View>
            )}

            {step === 3 && (
              <View>
                <Text style={rm.stepLabel}>STEP 3 · MAN OF THE MATCH</Text>
                <Text style={rm.cardTitle}>Tap your hero.</Text>
                <Text style={rm.cardSub}>
                  Pick from the pitch — no scrolling lists.
                </Text>

                {lineup ? (
                  <>
                    <View style={{ marginTop: 12 }}>
                      <PitchView
                        lineup={lineup}
                        selectable
                        selected={motmPlayerId}
                        onSelect={(p) =>
                          setMotmPlayerId(p.id === motmPlayerId ? null : p.id)
                        }
                      />
                    </View>
                    {selectedPlayer && (
                      <View style={rm.selectedChip}>
                        <View style={rm.selectedAvatar}>
                          <Text style={rm.selectedAvatarText}>
                            {selectedPlayer.firstName[0]}
                            {selectedPlayer.lastName[0]}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={rm.selectedName}>
                            {selectedPlayer.firstName} {selectedPlayer.lastName}
                          </Text>
                          <Text style={rm.selectedSub}>
                            #{selectedPlayer.number ?? "?"} ·{" "}
                            {selectedPlayer.isHome
                              ? (lineup.homeTeam.club.shortName ??
                                lineup.homeTeam.club.name)
                              : (lineup.awayTeam.club.shortName ??
                                lineup.awayTeam.club.name)}
                          </Text>
                        </View>
                        <Text style={rm.selectedBadge}>MOTM</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={{ paddingVertical: 40, alignItems: "center" }}>
                    <Text style={{ color: T.textFaint }}>
                      Lineup not available
                    </Text>
                  </View>
                )}
              </View>
            )}

            {step === 4 && (
              <View>
                <Text style={rm.stepLabel}>STEP 4 · REVIEW &amp; CONFIRM</Text>
                <Text style={rm.cardTitle}>Your submission.</Text>
                <Text style={rm.cardSub}>
                  Review your ratings before posting.
                </Text>

                <View style={rm.summaryGrid}>
                  <SummaryTile
                    label="Match"
                    value={String(matchRating)}
                    color={matchColor}
                  />
                  <SummaryTile
                    label="Atmos"
                    value={atmosphereStars > 0 ? `${atmosphereStars}★` : "—"}
                    color={T.text}
                  />
                  <SummaryTile
                    label="Ref"
                    value={refereeStars > 0 ? `${refereeStars}★` : "—"}
                    color={T.text}
                  />
                  <SummaryTile
                    label="MOTM"
                    value={selectedPlayer ? selectedPlayer.lastName : "—"}
                    color={selectedPlayer ? T.red : T.textFaint}
                  />
                </View>
              </View>
            )}
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Footer */}
        <View style={rm.footer}>
          {step > 1 && (
            <TouchableOpacity
              style={rm.skipBtn}
              onPress={() => setStep((s) => (s - 1) as RateStep)}
              activeOpacity={0.7}
            >
              <Text style={rm.skipText}>← Back</Text>
            </TouchableOpacity>
          )}
          {step < 4 ? (
            <TouchableOpacity
              style={rm.nextBtn}
              onPress={() => setStep((s) => (s + 1) as RateStep)}
              activeOpacity={0.85}
            >
              <Text style={rm.nextText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[rm.nextBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={rm.nextText}>Post ratings</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

function SummaryTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={rm.summaryTile}>
      <Text style={rm.summaryLabel}>{label.toUpperCase()}</Text>
      <Text style={[rm.summaryValue, { color }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const rm = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    paddingTop: 20,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: T.hairline,
  },
  progress: { flex: 1, flexDirection: "row", gap: 4 },
  progressBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: T.hairlineStrong,
  },
  progressBarActive: { backgroundColor: T.red },
  stepCount: {
    fontSize: 11,
    color: T.textFaint,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "right",
  },

  scroll: { paddingHorizontal: 20, paddingBottom: 20 },

  peekOuter: {
    height: 18,
    borderRadius: 18,
    marginHorizontal: 16,
    backgroundColor: T.surfaceHi,
    borderWidth: 1,
    borderColor: T.hairline,
    marginBottom: -12,
    opacity: 0.5,
  },
  peekInner: {
    height: 18,
    borderRadius: 18,
    marginHorizontal: 8,
    backgroundColor: T.surfaceHi,
    borderWidth: 1,
    borderColor: T.hairline,
    marginBottom: -12,
    opacity: 0.75,
  },
  card: {
    backgroundColor: T.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: T.hairlineStrong,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
  },

  stepLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: T.textFaint,
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: T.text,
    letterSpacing: -0.8,
    lineHeight: 30,
    marginBottom: 6,
  },
  cardSub: { fontSize: 13, color: T.textDim, marginBottom: 20 },

  bigNumWrap: { alignItems: "center", marginBottom: 20 },
  bigNum: {
    fontSize: 88,
    fontWeight: "900",
    letterSpacing: -4,
    lineHeight: 92,
  },
  bigNumLabel: {
    fontSize: 13,
    color: T.textFaint,
    fontWeight: "600",
    marginTop: 2,
  },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    width: "17%",
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: T.hairline,
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  chipText: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },

  selectedChip: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(225,29,42,0.08)",
    borderWidth: 1,
    borderColor: "rgba(225,29,42,0.3)",
  },
  selectedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.red,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedAvatarText: { fontSize: 13, fontWeight: "800", color: "#fff" },
  selectedName: { fontSize: 13, fontWeight: "700", color: T.text },
  selectedSub: { fontSize: 11, color: T.textDim, marginTop: 2 },
  selectedBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: T.red,
    letterSpacing: 0.5,
  },

  summaryGrid: { flexDirection: "row", gap: 8, marginTop: 16 },
  summaryTile: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: T.bg,
    borderWidth: 1,
    borderColor: T.hairline,
    alignItems: "center",
    gap: 4,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: T.textFaint,
    letterSpacing: 0.6,
  },
  summaryValue: { fontSize: 14, fontWeight: "800", letterSpacing: -0.3 },

  footer: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: T.hairline,
  },
  skipBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: T.hairlineStrong,
  },
  skipText: { fontSize: 14, fontWeight: "600", color: T.text },
  nextBtn: {
    flex: 2,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: T.red,
    shadowColor: T.red,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  nextText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});

/* ── Upcoming match layout ─────────────────────────────────── */

function UpcomingLayout({
  match,
  insets,
  onBack,
}: {
  match: Match;
  insets: { top: number };
  onBack: () => void;
}) {
  const venue = match.homeClub.venue;
  const dateFormatted = new Date(match.date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = new Date(match.date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <ScrollView
      style={up.container}
      contentContainerStyle={[up.content, { paddingTop: insets.top + 8 }]}
    >
      {/* Back */}
      <TouchableOpacity style={up.backBtn} onPress={onBack}>
        <Ionicons name="chevron-back" size={20} color={T.text} />
      </TouchableOpacity>

      {/* Meta */}
      <Text style={up.meta}>ROUND {match.round} · UPCOMING</Text>

      {/* Score hero (vs) */}
      <View style={up.hero}>
        <View style={up.clubCol}>
          <ClubLogo club={match.homeClub} size={64} />
          <Text style={up.clubName} numberOfLines={2}>
            {match.homeClub.shortName ?? match.homeClub.name}
          </Text>
        </View>
        <View style={up.centre}>
          <Text style={up.vs}>vs</Text>
          <View style={up.timeBadge}>
            <Text style={up.timeText}>{time}</Text>
          </View>
        </View>
        <View style={[up.clubCol, up.clubColRight]}>
          <ClubLogo club={match.awayClub} size={64} />
          <Text style={[up.clubName, { textAlign: "right" }]} numberOfLines={2}>
            {match.awayClub.shortName ?? match.awayClub.name}
          </Text>
        </View>
      </View>

      {/* Info card */}
      <View style={up.infoCard}>
        <InfoRow2
          icon="trophy-outline"
          label="Round"
          value={`Round ${match.round}`}
        />
        <InfoRow2 icon="calendar-outline" label="Date" value={dateFormatted} />
        {match.referee && (
          <InfoRow2
            icon="person-outline"
            label="Referee"
            value={`${match.referee.firstName} ${match.referee.lastName}`}
          />
        )}
        {venue && (
          <InfoRow2 icon="location-outline" label="Venue" value={venue} last />
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow2({
  icon,
  label,
  value,
  last,
}: {
  icon: any;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[up.infoRow, !last && up.infoRowBorder]}>
      <View style={up.infoLeft}>
        <Ionicons name={icon} size={15} color={T.textFaint} />
        <Text style={up.infoLabel}>{label}</Text>
      </View>
      <Text style={up.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const up = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 20, paddingBottom: 48 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.hairline,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  meta: {
    fontSize: 11,
    fontWeight: "800",
    color: T.textFaint,
    letterSpacing: 1,
    marginBottom: 20,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    gap: 8,
  },
  clubCol: { flex: 1, alignItems: "flex-start", gap: 10 },
  clubColRight: { alignItems: "flex-end" },
  clubName: { fontSize: 13, fontWeight: "700", color: T.text, lineHeight: 17 },
  centre: { alignItems: "center", gap: 8 },
  vs: {
    fontSize: 22,
    fontWeight: "800",
    color: T.textFaint,
    letterSpacing: -0.5,
  },
  timeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.hairline,
  },
  timeText: { fontSize: 13, fontWeight: "700", color: T.text },
  infoCard: {
    backgroundColor: T.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.hairline,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: T.hairline },
  infoLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoLabel: { fontSize: 14, color: T.textDim },
  infoValue: {
    fontSize: 14,
    color: T.text,
    maxWidth: "55%",
    textAlign: "right",
  },
});

/* ── Past match layout ─────────────────────────────────────── */

function PastLayout({
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
  const [activeTab, setActiveTab] = useState<TabId>("buzz");
  const [communityRatings, setCommunityRatings] = useState<MatchRatings | null>(
    null,
  );
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  const [homeScore, awayScore] = match.result
    ? match.result.split("-").map(Number)
    : [null, null];

  useEffect(() => {
    if (!token) return;
    getMatchRatings(match.id, token)
      .then(setCommunityRatings)
      .catch(() => {});
  }, [match.id, token]);

  const motm = communityRatings?.playerRatings
    ?.filter((p) => p.bestPlayerVotes > 0)
    ?.sort((a, b) => b.bestPlayerVotes - a.bestPlayerVotes)[0];

  const motmName = motm ? `${motm.firstName} ${motm.lastName}` : undefined;

  return (
    <View style={st.container}>
      {/* ── Score hero ─────────────────────────────────────── */}
      <View style={[st.heroWrap, { paddingTop: insets.top + 8 }]}>
        {/* Nav bar */}
        <View style={st.navBar}>
          <TouchableOpacity style={st.backBtn} onPress={onBack}>
            <Ionicons name="chevron-back" size={20} color={T.text} />
          </TouchableOpacity>
          <Text style={st.navMeta}>
            R{match.round} · {dateStr(match.date)}
            {match.referee
              ? ` · ${match.referee.firstName[0]}. ${match.referee.lastName}`
              : ""}
          </Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Score */}
        <View style={st.scoreRow}>
          <View style={st.clubCol}>
            <ClubLogo club={match.homeClub} size={56} />
            <Text style={st.clubName} numberOfLines={1}>
              {match.homeClub.shortName ?? match.homeClub.name}
            </Text>
          </View>

          <View style={st.scoreCentre}>
            {homeScore != null && awayScore != null ? (
              <>
                <View style={st.scoreNumRow}>
                  <Text
                    style={[
                      st.scoreNum,
                      { color: scoreColorFor(homeScore, awayScore) },
                    ]}
                  >
                    {homeScore}
                  </Text>
                  <Text style={st.scoreDash}>—</Text>
                  <Text
                    style={[
                      st.scoreNum,
                      { color: scoreColorFor(awayScore, homeScore) },
                    ]}
                  >
                    {awayScore}
                  </Text>
                </View>
                <Text style={st.ftLabel}>FULL TIME</Text>
              </>
            ) : (
              <Text style={st.scoreDash}>–:–</Text>
            )}
          </View>

          <View style={[st.clubCol, { alignItems: "flex-end" }]}>
            <ClubLogo club={match.awayClub} size={56} />
            <Text
              style={[st.clubName, { textAlign: "right" }]}
              numberOfLines={1}
            >
              {match.awayClub.shortName ?? match.awayClub.name}
            </Text>
          </View>
        </View>

        {/* Rate CTA */}
        {communityRatings?.userMatchRating != null ? (
          <View style={[st.rateCta, st.rateCtaDone]}>
            <View style={st.rateCtaDoneLeft}>
              <Ionicons name="checkmark-circle" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={st.rateCtaText}>You rated this match</Text>
            </View>
            <View style={[st.rateCtaBadge]}>
              <Text style={st.rateCtaBadgeText}>{communityRatings.userMatchRating}/10</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={st.rateCta}
            onPress={() => setRatingModalOpen(true)}
            activeOpacity={0.85}
          >
            <Text style={st.rateCtaText}>Rate this match</Text>
            <View style={st.rateCtaRight}>
              <Text style={st.rateCtaMeta}>4 cards · 30s</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <TabBar active={activeTab} onPress={setActiveTab} />

      {/* ── Tab content ────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "buzz" && (
          <BuzzTab ratings={communityRatings} motmName={motmName} />
        )}

        {activeTab === "firstxi" && (
          <View style={{ paddingHorizontal: 20 }}>
            {lineupLoading ? (
              <View style={{ paddingTop: 48, alignItems: "center", gap: 12 }}>
                <ActivityIndicator color={T.red} size="large" />
                <Text style={{ color: T.textFaint, fontSize: 13 }}>
                  Loading lineup...
                </Text>
              </View>
            ) : lineup ? (
              <>
                <PitchView lineup={lineup} />
                <BenchSection
                  homeTeam={lineup.homeTeam}
                  awayTeam={lineup.awayTeam}
                />
              </>
            ) : (
              <View style={{ alignItems: "center", paddingTop: 40, gap: 12 }}>
                <Ionicons name="people-outline" size={36} color={T.textFaint} />
                <Text style={{ color: T.textFaint, fontSize: 14 }}>
                  Lineup not available
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "stats" && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 20,
              alignItems: "center",
              gap: 12,
            }}
          >
            <Ionicons
              name="stats-chart-outline"
              size={36}
              color={T.textFaint}
            />
            <Text
              style={{ color: T.textFaint, fontSize: 14, fontWeight: "500" }}
            >
              Match stats coming soon
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Rating modal */}
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

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },

  heroWrap: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.hairline,
    marginBottom: 16,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.hairline,
    justifyContent: "center",
    alignItems: "center",
  },
  navMeta: {
    fontSize: 11,
    color: T.textFaint,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  clubCol: { flex: 1, alignItems: "flex-start", gap: 8 },
  clubName: { fontSize: 12, fontWeight: "700", color: T.text },
  scoreCentre: { alignItems: "center", gap: 4 },
  scoreNumRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  scoreNum: {
    fontSize: 52,
    fontWeight: "900",
    letterSpacing: -2,
    lineHeight: 56,
  },
  scoreDash: { fontSize: 26, fontWeight: "600", color: T.textFaint },
  ftLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: T.textFaint,
    letterSpacing: 0.8,
  },

  rateCta: {
    height: 56,
    borderRadius: 16,
    backgroundColor: T.red,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    shadowColor: T.red,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  rateCtaDone: { backgroundColor: "rgba(225,29,42,0.5)", shadowOpacity: 0.15 },
  rateCtaDoneLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  rateCtaBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  rateCtaBadgeText: { fontSize: 14, fontWeight: "800", color: "#fff" },
  rateCtaText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  rateCtaRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  rateCtaMeta: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
});

/* ── Root screen ───────────────────────────────────────────── */

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
        if (m.finished) {
          setLineupLoading(true);
          getMatchLineup(m.id, token)
            .then(setLineup)
            .catch(() => {})
            .finally(() => setLineupLoading(false));
        }
      })
      .catch((e) => Alert.alert("Error", e.message ?? "Could not load match."))
      .finally(() => setLoading(false));
  }, [matchId, token]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: T.bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color={T.red} size="large" />
      </View>
    );
  }

  if (!match) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: T.bg,
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Ionicons name="alert-circle-outline" size={40} color={T.textFaint} />
        <Text style={{ color: T.textFaint, fontSize: 15 }}>
          Match not found.
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: T.red, fontSize: 14, fontWeight: "600" }}>
            Go back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return match.finished ? (
    <PastLayout
      match={match}
      lineup={lineup}
      lineupLoading={lineupLoading}
      insets={insets}
      onBack={() => router.back()}
    />
  ) : (
    <UpcomingLayout
      match={match}
      insets={insets}
      onBack={() => router.back()}
    />
  );
}
