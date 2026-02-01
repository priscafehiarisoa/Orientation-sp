'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/ClientApp';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserRole } from '@/services/userService';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    redirectTo?: string;
}

/**
 * Composant pour protéger les routes selon le rôle utilisateur
 */
export default function RoleProtectedRoute({ 
    children, 
    allowedRoles,
    redirectTo = '/dashboard' 
}: RoleProtectedRouteProps) {
    const [user, loadingAuth] = useAuthState(auth);
    const { profile, loading: loadingProfile } = useUserProfile(user);
    const router = useRouter();

    useEffect(() => {
        if (!loadingAuth && !loadingProfile) {
            if (!user || !profile) {
                router.push('/login');
            } else if (!allowedRoles.includes(profile.role)) {
                router.push(redirectTo);
            }
        }
    }, [user, profile, loadingAuth, loadingProfile, allowedRoles, redirectTo, router]);

    if (loadingAuth || loadingProfile) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Chargement...</p>
            </div>
        );
    }

    if (!user || !profile) {
        return null;
    }

    if (!allowedRoles.includes(profile.role)) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Vous n'avez pas accès à cette page.</p>
            </div>
        );
    }

    return <>{children}</>;
}
