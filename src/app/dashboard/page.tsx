'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider, updateProfile
} from "@firebase/auth";

import {auth} from '../../firebase/ClientApp';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function DashboardPage() {
    const router = useRouter();
    const [user, loadingAuth] = useAuthState(auth);
    const { profile, loading: loadingProfile } = useUserProfile(user);

    if (loadingAuth || loadingProfile) {
        return (
            <div className="container mx-auto px-4">
                <p>Chargement...</p>
            </div>
        );
    }

    if (!user || !profile) {
        return (
            <div className="container mx-auto px-4">
                <p>Veuillez vous connecter.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4">
                Bienvenue {profile.role === 'prof' ? 'Professeur' : 'Élève'} {profile.displayName}
            </h1>
            
            <div className="bg-white rounded-lg shadow p-6 mb-4">
                <h2 className="text-xl font-semibold mb-2">Informations du profil</h2>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Rôle:</strong> {profile.role === 'prof' ? 'Professeur' : 'Élève'}</p>
            </div>

            {profile.role === 'prof' ? (
                <div className="bg-blue-50 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Espace Professeur</h2>
                    <ul className="space-y-2">
                        <li>• Gérer les questionnaires</li>
                        <li>• Voir les résultats des élèves</li>
                        <li>• Créer de nouveaux contenus</li>
                    </ul>
                </div>
            ) : (
                <div className="bg-green-50 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Espace Élève</h2>
                    <ul className="space-y-2">
                        <li>• Répondre aux questionnaires</li>
                        <li>• Voir mes résultats</li>
                        <li>• Suivre ma progression</li>
                    </ul>
                    <button
                        onClick={() => router.push('/questionnaires')}
                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Accéder aux questionnaires
                    </button>
                </div>
            )}
        </div>
    );
}