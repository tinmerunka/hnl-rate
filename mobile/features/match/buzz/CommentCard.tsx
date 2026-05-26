import { T } from '@/constants/theme';
import { type MatchComment, useAuth } from '@/context/auth';
import { voteOnComment } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function CommentCard({
  item,
  matchId,
}: {
  item: MatchComment;
  matchId: number;
}) {
  const { token } = useAuth();
  const date = new Date(item.createdAt).toLocaleDateString('hr-HR', {
    day: 'numeric',
    month: 'short',
  });
  const ratingColor =
    item.rating >= 7 ? T.win : item.rating >= 5 ? T.text : T.loss;

  const [upvotes, setUpvotes] = useState(item.upvotes);
  const [downvotes, setDownvotes] = useState(item.downvotes);
  const [userVote, setUserVote] = useState<'UP' | 'DOWN' | null>(item.userVote);
  const [voting, setVoting] = useState(false);

  async function handleVote(voteType: 'UP' | 'DOWN') {
    if (!token || voting) return;
    const prevUpvotes = upvotes;
    const prevDownvotes = downvotes;
    const prevUserVote = userVote;

    if (userVote === voteType) {
      setUserVote(null);
      if (voteType === 'UP') setUpvotes((v) => v - 1);
      else setDownvotes((v) => v - 1);
    } else {
      if (userVote === 'UP') setUpvotes((v) => v - 1);
      if (userVote === 'DOWN') setDownvotes((v) => v - 1);
      setUserVote(voteType);
      if (voteType === 'UP') setUpvotes((v) => v + 1);
      else setDownvotes((v) => v + 1);
    }

    setVoting(true);
    try {
      const result = await voteOnComment(matchId, item.ratingId, voteType, token);
      setUpvotes(result.upvotes);
      setDownvotes(result.downvotes);
      setUserVote(result.userVote);
    } catch {
      setUpvotes(prevUpvotes);
      setDownvotes(prevDownvotes);
      setUserVote(prevUserVote);
    } finally {
      setVoting(false);
    }
  }

  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>
            {item.username[0].toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.commentUsername}>{item.username}</Text>
          <Text style={styles.commentDate}>{date}</Text>
        </View>
        <View style={[styles.commentBadge, { borderColor: ratingColor }]}>
          <Text style={[styles.commentBadgeText, { color: ratingColor }]}>
            {item.rating}
          </Text>
        </View>
      </View>
      <Text style={styles.commentText}>{item.comment}</Text>
      <View style={styles.commentVoteRow}>
        <TouchableOpacity
          style={styles.voteBtn}
          onPress={() => handleVote('UP')}
          disabled={voting}
          activeOpacity={0.7}
        >
          <Ionicons
            name={userVote === 'UP' ? 'thumbs-up' : 'thumbs-up-outline'}
            size={14}
            color={userVote === 'UP' ? T.win : T.textFaint}
          />
          <Text
            style={[
              styles.voteCount,
              { color: userVote === 'UP' ? T.win : T.textFaint },
            ]}
          >
            {upvotes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.voteBtn}
          onPress={() => handleVote('DOWN')}
          disabled={voting}
          activeOpacity={0.7}
        >
          <Ionicons
            name={userVote === 'DOWN' ? 'thumbs-down' : 'thumbs-down-outline'}
            size={14}
            color={userVote === 'DOWN' ? T.loss : T.textFaint}
          />
          <Text
            style={[
              styles.voteCount,
              { color: userVote === 'DOWN' ? T.loss : T.textFaint },
            ]}
          >
            {downvotes}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  commentCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.hairline,
    padding: 14,
    gap: 10,
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.surfaceHi,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.hairline,
  },
  commentAvatarText: { fontSize: 13, fontWeight: '800', color: T.text },
  commentUsername: { fontSize: 13, fontWeight: '700', color: T.text },
  commentDate: { fontSize: 11, color: T.textFaint, marginTop: 1 },
  commentBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentBadgeText: { fontSize: 14, fontWeight: '900' },
  commentText: { fontSize: 14, color: T.textDim, lineHeight: 20 },
  commentVoteRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  voteBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  voteCount: { fontSize: 12, fontWeight: '600' },
});
