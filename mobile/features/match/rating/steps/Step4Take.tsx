import { T } from '@/constants/theme';
import { Text, TextInput, View } from 'react-native';
import { rm } from '../../styles/rateModal.styles';

export function Step4Take({
  comment,
  setComment,
}: {
  comment: string;
  setComment: (s: string) => void;
}) {
  return (
    <View>
      <Text style={rm.stepLabel}>KORAK 4 · TVOJ DOJAM</Text>
      <Text style={rm.cardTitle}>Reci nešto.</Text>
      <Text style={rm.cardSub}>
        Opcionalno — podijeli dojmove o utakmici.
      </Text>
      <TextInput
        style={rm.commentInput}
        placeholder="Što se istaknulo? Dojmovi o utakmici..."
        placeholderTextColor={T.textFaint}
        multiline
        maxLength={280}
        value={comment}
        onChangeText={setComment}
        textAlignVertical="top"
      />
      <Text style={rm.commentCount}>{comment.length}/280</Text>
    </View>
  );
}
