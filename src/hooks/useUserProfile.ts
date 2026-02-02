import { useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { getUserProfile, UserProfile } from '@/services/userService';

/**
 * Hook pour récupérer le profil utilisateur depuis Firestore
 */
export function useUserProfile(user: User | null | undefined) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const userProfile = await getUserProfile(user.uid);
            setProfile(userProfile);
            setError(null);
        } catch (err) {
            console.error('Error fetching user profile:', err);
            setError(err as Error);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const refresh = useCallback(() => {
        return fetchProfile();
    }, [fetchProfile]);

    return { profile, loading, error, refresh };
}
