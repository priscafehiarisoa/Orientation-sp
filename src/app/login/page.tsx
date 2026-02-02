'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from "@firebase/auth";

import {auth} from '../../firebase/ClientApp';
import { getUserProfile, createUserProfile } from '@/services/userService';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fonction pour créer le cookie de session après connexion
    const createSessionCookie = async (user: any) => {
        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/auth/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to create session cookie');
            }
            
            const data = await response.json();
            console.log('Session cookie created:', data);
        } catch (error) {
            console.error("Error creating session cookie:", error);
            throw error;
        }
    };

    // Fonction pour vérifier/créer le profil Firestore
    const ensureUserProfile = async (user: any) => {
        try {
            console.log('Vérification profil Firestore pour:', user.uid);
            const profile = await getUserProfile(user.uid);
            
            if (!profile) {
                console.log('⚠️ Profil manquant, création automatique...');
                await createUserProfile(user, 'eleve'); // Par défaut élève, peut être modifié
                console.log('✅ Profil créé avec succès');
            } else {
                console.log('✅ Profil existe:', profile);
            }
        } catch (error) {
            console.error('Erreur vérification profil:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Vérifier/créer le profil Firestore
            await ensureUserProfile(userCredential.user);
            
            // Créer le cookie de session avant de rediriger
            await createSessionCookie(userCredential.user);
            console.log('Email sign-in successful:', userCredential.user.email);
            router.push('/dashboard');
        } catch (error: any) {
            console.error("Authentication error:", error);
            if (error.code === 'auth/user-not-found') {
                setError('Aucun compte trouvé avec cet email.');
            } else if (error.code === 'auth/wrong-password') {
                setError('Mot de passe incorrect.');
            } else if (error.code === 'auth/invalid-email') {
                setError('Email invalide.');
            } else if (error.code === 'auth/invalid-credential') {
                setError('Email ou mot de passe incorrect.');
            } else {
                setError('Erreur lors de la connexion. Veuillez réessayer.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const userCredential = await signInWithPopup(auth, provider);
            
            // Vérifier/créer le profil Firestore
            await ensureUserProfile(userCredential.user);
            
            // Créer le cookie de session avant de rediriger
            await createSessionCookie(userCredential.user);
            console.log('Google sign-in successful:', userCredential.user.email);
            router.push('/dashboard');
        } catch (error: any) {
            console.error("Google sign-in error:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                setError('Connexion annulée.');
            } else {
                setError('Erreur lors de la connexion avec Google.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="flex justify-center mb-4">
                        <span className="text-6xl">🧠</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Connexion
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Connectez-vous à votre compte Chemins de Spé
                    </p>
                </div>
                <div className="bg-white shadow-xl rounded-xl p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="email@exemple.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Mot de passe
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Mot de passe"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-700 text-sm text-center">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Se connecter avec Google
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">ou</span>
                            </div>
                        </div>

                        <div className="text-center space-y-3 pt-4 border-t">
                            <p className="text-sm text-gray-600 font-medium">
                                Pas encore de compte ?
                            </p>
                            <div className="flex gap-2">
                                <Link 
                                    href="/register/eleve"
                                    className="flex-1 py-2 px-4 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50"
                                >
                                    Inscription Élève
                                </Link>
                                {/* <Link 
                                    href="/register/prof"
                                    className="flex-1 py-2 px-4 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                                >
                                    Inscription Prof
                                </Link> */}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
