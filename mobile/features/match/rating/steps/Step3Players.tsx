import { T } from '@/constants/theme';
import type { MatchLineup } from '@/context/auth';
import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PitchView } from '../../lineup/PitchView';
import { rm } from '../../styles/rateModal.styles';
import type { PlayerWithClub } from '../../hooks/useRateModal';

export function Step3Players({
  lineup,
  selectedForActionId,
  bestPlayerId,
  worstPlayerId,
  actionPlayer,
  playerComments,
  onSelectPlayer,
  toggleBest,
  toggleWorst,
  setPlayerComment,
  clearSelection,
}: {
  lineup: MatchLineup | null;
  selectedForActionId: number | null;
  bestPlayerId: number | null;
  worstPlayerId: number | null;
  actionPlayer: PlayerWithClub | null | undefined;
  playerComments: Record<number, string>;
  onSelectPlayer: (playerId: number) => void;
  toggleBest: (id: number) => void;
  toggleWorst: (id: number) => void;
  setPlayerComment: (id: number, text: string) => void;
  clearSelection: () => void;
}) {
  return (
    <View>
      <Text style={rm.stepLabel}>KORAK 3 · IGRAČI</Text>
      <Text style={rm.cardTitle}>Tko se istaknuo?</Text>
      <Text style={rm.cardSub}>
        Dodirni igrača da označiš najboljeg ili najgoreg.
      </Text>

      {lineup ? (
        <>
          <View style={{ marginTop: 12 }}>
            <PitchView
              lineup={lineup}
              selectable
              selected={selectedForActionId}
              bestPlayerId={bestPlayerId}
              worstPlayerId={worstPlayerId}
              onSelect={(p) =>
                onSelectPlayer(p.id === selectedForActionId ? -1 : p.id)
              }
            />
          </View>

          {actionPlayer && (
            <View style={rm.actionCard}>
              <View style={rm.actionHeader}>
                <View
                  style={[
                    rm.actionNum,
                    actionPlayer.isHome ? rm.actionNumHome : rm.actionNumAway,
                  ]}
                >
                  <Text
                    style={[
                      rm.actionNumText,
                      !actionPlayer.isHome && { color: '#fff' },
                    ]}
                  >
                    {actionPlayer.number ?? '?'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={rm.actionName}>
                    {actionPlayer.firstName} {actionPlayer.lastName}
                  </Text>
                  <Text style={rm.actionClub}>
                    {actionPlayer.isHome
                      ? (lineup.homeTeam.club.shortName ?? lineup.homeTeam.club.name)
                      : (lineup.awayTeam.club.shortName ?? lineup.awayTeam.club.name)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={clearSelection}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={18} color={T.textFaint} />
                </TouchableOpacity>
              </View>

              <View style={rm.actionBtns}>
                <TouchableOpacity
                  style={[
                    rm.actionBtn,
                    bestPlayerId === actionPlayer.id && rm.actionBtnBest,
                  ]}
                  onPress={() => toggleBest(actionPlayer.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      rm.actionBtnText,
                      bestPlayerId === actionPlayer.id && { color: T.win },
                    ]}
                  >
                    Najbolji igrač
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    rm.actionBtn,
                    worstPlayerId === actionPlayer.id && rm.actionBtnWorst,
                  ]}
                  onPress={() => toggleWorst(actionPlayer.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      rm.actionBtnText,
                      worstPlayerId === actionPlayer.id && { color: T.loss },
                    ]}
                  >
                    Najgori igrač
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={rm.actionComment}
                placeholder="Komentar (opcionalno)..."
                placeholderTextColor={T.textFaint}
                value={playerComments[actionPlayer.id] ?? ''}
                onChangeText={(v) => setPlayerComment(actionPlayer.id, v)}
                maxLength={140}
              />
            </View>
          )}
        </>
      ) : (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <Text style={{ color: T.textFaint }}>Postava nije dostupna</Text>
        </View>
      )}
    </View>
  );
}
