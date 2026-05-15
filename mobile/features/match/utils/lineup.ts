import type { LineupPlayer } from '@/context/auth';

export const POS_SHORT: Record<string, string> = {
  Goalkeeper: 'GK',
  Defender: 'DF',
  Midfielder: 'MF',
  Attacker: 'FW',
};

export function posToRow(position: string | undefined): number {
  if (!position) return 3;
  if (position === 'Goalkeeper') return 1;
  if (position === 'Defender') return 2;
  if (position === 'Midfielder') return 3;
  return 4;
}

export function computeFormation(players: LineupPlayer[]): string {
  const rowMap = new Map<number, number>();
  for (const p of players) {
    const row = p.grid ? parseInt(p.grid.split(':')[0], 10) : posToRow(p.position);
    rowMap.set(row, (rowMap.get(row) ?? 0) + 1);
  }
  const rows = Array.from(rowMap.keys()).sort((a, b) => a - b);
  return rows
    .slice(1)
    .map((r) => rowMap.get(r)!)
    .join('-');
}

export function computePositions(
  players: LineupPlayer[],
  isHome: boolean,
  pW: number,
  pH: number,
): { player: LineupPlayer; x: number; y: number }[] {
  const rowMap = new Map<number, LineupPlayer[]>();
  for (const p of players) {
    const row = p.grid ? parseInt(p.grid.split(':')[0], 10) : posToRow(p.position);
    if (!rowMap.has(row)) rowMap.set(row, []);
    rowMap.get(row)!.push(p);
  }
  const sortedRows = Array.from(rowMap.keys()).sort((a, b) => a - b);
  const numRows = sortedRows.length;
  const halfH = pH / 2;
  const padEdge = 34;
  const padCenter = 20;

  return sortedRows.flatMap((row, rowIndex) => {
    const rowPlayers = rowMap.get(row)!.sort((a, b) => {
      const colA = a.grid ? parseInt(a.grid.split(':')[1], 10) : 0;
      const colB = b.grid ? parseInt(b.grid.split(':')[1], 10) : 0;
      return colA - colB;
    });
    const n = rowPlayers.length;
    const frac = rowIndex / Math.max(numRows - 1, 1);
    const y = isHome
      ? padEdge + frac * (halfH - padEdge - padCenter)
      : pH - padEdge - frac * (halfH - padEdge - padCenter);
    return rowPlayers.map((player, i) => ({
      player,
      x: ((i + 1) / (n + 1)) * pW,
      y,
    }));
  });
}
