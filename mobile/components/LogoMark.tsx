import { T } from '@/constants/theme';
import React from 'react';
import { View } from 'react-native';

export function LogoMark({ size = 40 }: { size?: number }) {
  const sq = size / 7;
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      if ((i + j) % 2 === 0) {
        cells.push(
          <View
            key={`${i}-${j}`}
            style={{
              position: 'absolute',
              left: i * sq,
              top: j * sq,
              width: sq,
              height: sq,
              backgroundColor: '#fff',
            }}
          />,
        );
      }
    }
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.275,
        backgroundColor: T.red,
        overflow: 'hidden',
      }}
    >
      {cells}
    </View>
  );
}
