import { type Club, useAuth } from '@/context/auth';
import { removeFavoriteClub, setFavoriteClub } from '@/services/api';
import { useState } from 'react';
import { Alert } from 'react-native';

export function useFavoriteToggle(club: Club | null) {
  const { token, userProfile, updateProfile } = useAuth();
  const [toggling, setToggling] = useState(false);

  const isFavorite = club ? userProfile?.favoriteClub?.id === club.id : false;

  async function toggle() {
    if (!token || !club) return;
    setToggling(true);
    try {
      const updated = isFavorite
        ? await removeFavoriteClub(token)
        : await setFavoriteClub(club.id, token);
      updateProfile(updated);
    } catch (e: any) {
      Alert.alert('Greška', e.message ?? 'Ažuriranje omiljenog kluba nije uspjelo.');
    } finally {
      setToggling(false);
    }
  }

  return { isFavorite, toggling, toggle };
}
