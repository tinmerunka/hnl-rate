import { T } from '@/constants/theme';

export function scoreColorFor(a: number, b: number) {
  if (a === b) return T.draw;
  return a > b ? T.win : T.loss;
}
