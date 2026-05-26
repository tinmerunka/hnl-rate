import { Text, View } from 'react-native';
import { StarRow } from '../StarRow';
import { rm } from '../../styles/rateModal.styles';

export function Step2Vibe({
  atmosphereStars,
  setAtmosphereStars,
  refereeStars,
  setRefereeStars,
  hasReferee,
  refereeLabel,
}: {
  atmosphereStars: number;
  setAtmosphereStars: (n: number) => void;
  refereeStars: number;
  setRefereeStars: (n: number) => void;
  hasReferee: boolean;
  refereeLabel?: string;
}) {
  return (
    <View>
      <Text style={rm.stepLabel}>KORAK 2 · ATMOSFERA I SUDAC</Text>
      <Text style={rm.cardTitle}>Atmosfera i suđenje.</Text>

      <View style={{ marginTop: 8 }}>
        <StarRow
          label="Atmosfera"
          sub="Publika, tifo, energija"
          value={atmosphereStars}
          onChange={setAtmosphereStars}
        />
        {hasReferee && (
          <StarRow
            label="Sudac"
            sub={refereeLabel}
            value={refereeStars}
            onChange={setRefereeStars}
          />
        )}
      </View>
    </View>
  );
}
