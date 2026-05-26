import { T } from '@/constants/theme';
import type { MatchLineup, MatchRatings } from '@/context/auth';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRateModal, type RateStep } from '../hooks/useRateModal';
import { rm } from '../styles/rateModal.styles';
import { Step1Match } from './steps/Step1Match';
import { Step2Vibe } from './steps/Step2Vibe';
import { Step3Players } from './steps/Step3Players';
import { Step4Take } from './steps/Step4Take';
import { Step5Review } from './steps/Step5Review';

export function RateModal({
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
  const m = useRateModal({
    visible,
    matchId,
    token,
    lineup,
    hasReferee,
    onDone,
    onClose,
  });

  const matchColor =
    m.matchRating >= 7 ? T.win : m.matchRating >= 5 ? T.text : T.loss;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={rm.container}>
        <View style={rm.header}>
          <TouchableOpacity
            onPress={onClose}
            style={rm.closeBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={T.text} />
          </TouchableOpacity>
          <View style={rm.progress}>
            {([1, 2, 3, 4, 5] as RateStep[]).map((i) => (
              <View
                key={i}
                style={[rm.progressBar, i <= m.step && rm.progressBarActive]}
              />
            ))}
          </View>
          <Text style={rm.stepCount}>{m.step}/5</Text>
        </View>

        <ScrollView
          contentContainerStyle={rm.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={rm.peekOuter} />
          <View style={rm.peekInner} />

          <View style={rm.card}>
            {m.step === 1 && (
              <Step1Match
                matchRating={m.matchRating}
                setMatchRating={m.setMatchRating}
              />
            )}

            {m.step === 2 && (
              <Step2Vibe
                atmosphereStars={m.atmosphereStars}
                setAtmosphereStars={m.setAtmosphereStars}
                refereeStars={m.refereeStars}
                setRefereeStars={m.setRefereeStars}
                hasReferee={hasReferee}
                refereeLabel={refereeLabel}
              />
            )}

            {m.step === 3 && (
              <Step3Players
                lineup={lineup}
                selectedForActionId={m.selectedForActionId}
                bestPlayerId={m.bestPlayerId}
                worstPlayerId={m.worstPlayerId}
                actionPlayer={m.actionPlayer}
                playerComments={m.playerComments}
                onSelectPlayer={(id) => m.selectForAction(id === -1 ? null : id)}
                toggleBest={m.toggleBest}
                toggleWorst={m.toggleWorst}
                setPlayerComment={m.setPlayerComment}
                clearSelection={() => m.selectForAction(null)}
              />
            )}

            {m.step === 4 && (
              <Step4Take comment={m.comment} setComment={m.setComment} />
            )}

            {m.step === 5 && (
              <Step5Review
                matchRating={m.matchRating}
                matchColor={matchColor}
                atmosphereStars={m.atmosphereStars}
                refereeStars={m.refereeStars}
                bestPlayer={m.bestPlayer}
                worstPlayer={m.worstPlayer}
                comment={m.comment}
              />
            )}
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>

        <View style={rm.footer}>
          {m.step > 1 && (
            <TouchableOpacity
              style={rm.skipBtn}
              onPress={() => m.setStep((m.step - 1) as RateStep)}
              activeOpacity={0.7}
            >
              <Text style={rm.skipText}>← Natrag</Text>
            </TouchableOpacity>
          )}
          {m.step < 5 ? (
            <TouchableOpacity
              style={rm.nextBtn}
              onPress={() => m.setStep((m.step + 1) as RateStep)}
              activeOpacity={0.85}
            >
              <Text style={rm.nextText}>
                {m.step === 4 ? 'Pregled →' : 'Dalje →'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[rm.nextBtn, m.submitting && { opacity: 0.6 }]}
              onPress={m.handleSubmit}
              disabled={m.submitting}
              activeOpacity={0.85}
            >
              {m.submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={rm.nextText}>Objavi ocjene</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
