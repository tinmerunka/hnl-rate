import type { Club } from '@/context/auth';

export function useClubLogoSource(club: Pick<Club, 'crest' | 'logoUrl'> | undefined | null) {
  return club?.crest ?? club?.logoUrl;
}
