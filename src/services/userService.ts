import { db } from '@/firebase/ClientApp';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

export type UserRole = 'prof' | 'eleve';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Crée ou met à jour le profil utilisateur dans Firestore
 */
export async function createUserProfile(
    user: User,
    role: UserRole,
    additionalData?: Partial<UserProfile>
): Promise<void> {
    const userRef = doc(db, 'users', user.uid);
    
    const userData: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...additionalData,
    };

    await setDoc(userRef, userData, { merge: true });
}

/**
 * Récupère le profil utilisateur depuis Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    }

    return null;
}

/**
 * Met à jour le rôle de l'utilisateur
 */
export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        role,
        updatedAt: new Date(),
    });
}

/**
 * Vérifie si un utilisateur a le rôle requis
 */
export async function hasRole(uid: string, requiredRole: UserRole): Promise<boolean> {
    const profile = await getUserProfile(uid);
    return profile?.role === requiredRole;
}
