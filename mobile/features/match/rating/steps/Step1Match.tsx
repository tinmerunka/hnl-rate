import { T } from '@/constants/theme';
import { Text, TouchableOpacity, View } from 'react-native';
import { rm } from '../../styles/rateModal.styles';

function matchLabel(r: number) {
  if (r >= 9) return 'Iznimno';
  if (r >= 7) return 'Solidno · zabavno';
  if (r >= 5) return 'Prosječno';
  if (r >= 3) return 'Razočaravajuće';
  return 'Negledljivo';
}

export function Step1Match({
  matchRating,
  setMatchRating,
}: {
  matchRating: number;
  setMatchRating: (n: number) => void;
}) {
  const color = matchRating >= 7 ? T.win : matchRating >= 5 ? T.text : T.loss;

  return (
    <View>
      <Text style={rm.stepLabel}>KORAK 1 · UKUPNA OCJENA</Text>
      <Text style={rm.cardTitle}>Kakva je bila utakmica?</Text>
      <Text style={rm.cardSub}>Dodirni broj — kasnije možeš promijeniti.</Text>

      <View style={rm.bigNumWrap}>
        <Text style={[rm.bigNum, { color }]}>{matchRating}</Text>
        <Text style={rm.bigNumLabel}>{matchLabel(matchRating)}</Text>
      </View>

      <View style={rm.chips}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
          const on = n === matchRating;
          const c = n >= 7 ? T.win : n >= 5 ? T.text : T.loss;
          return (
            <TouchableOpacity
              key={n}
              style={[rm.chip, on && { backgroundColor: c, borderColor: c }]}
              onPress={() => setMatchRating(n)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  rm.chipText,
                  on && { color: '#fff' },
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
  );
}

export { matchLabel };
