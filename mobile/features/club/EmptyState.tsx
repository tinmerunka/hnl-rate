import { Text, View } from 'react-native';
import { screen as styles } from './styles/club.styles';

export function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}
