import { T } from '@/constants/theme';
import { useRef } from 'react';
import { PanResponder, View } from 'react-native';

export function RatingSlider({
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
          onChangeRef.current(Math.max(1, Math.min(10, Math.round(1 + pct * 9))));
        }
      },
      onPanResponderMove: (e) => {
        const w = trackWidthRef.current;
        if (w > 0) {
          const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / w));
          onChangeRef.current(Math.max(1, Math.min(10, Math.round(1 + pct * 9))));
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
      style={{ height: 44, justifyContent: 'center' }}
    >
      <View style={{ height: 5, backgroundColor: T.surfaceHi, borderRadius: 3 }}>
        <View
          style={{
            position: 'absolute',
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
          position: 'absolute',
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
