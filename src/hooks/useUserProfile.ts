import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { getUserProfile, UserProfile } from '@/services/userService';

/**
 * Hook pour récupérer le profil utilisateur depuis Firestore
 */
export function useUserProfile(user: User | null | undefined) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        getUserProfile(user.uid)
            .then((userProfile) => {
                setProfile(userProfile);
                setError(null);
            })
            .catch((err) => {
                console.error('Error fetching user profile:', err);
                setError(err);
                setProfile(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [user]);

    return { profile, loading, error };
}
