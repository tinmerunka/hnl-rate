import type { Club } from '@/context/auth';

export function clubInitials(club: Pick<Club, 'tla' | 'name'>) {
  return club.tla ?? club.name.slice(0, 3).toUpperCase();
}

export function userInitial(username: string) {
  return username[0]?.toUpperCase() ?? '?';
}
