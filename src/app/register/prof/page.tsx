'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider, 
    updateProfile
} from "@firebase/auth";
import Link from 'next/link';

import {auth} from '../../../firebase/ClientApp';
import { createUserProfile } from '@/services/userService';

export default function RegisterProfPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Code d'accès pour les professeurs (à changer en production)
    const PROF_ACCESS_CODE = 'PROF2024';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (accessCode !== PROF_ACCESS_CODE) {
            setError('Code d\'accès professeur invalide.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {
                displayName: name
            });
            // Créer le profil utilisateur dans Firestore avec le rôle PROF
            await createUserProfile(userCredential.user, 'prof');
            // Créer le cookie de session avant de rediriger
            await createSessionCookie(userCredential.user);
            router.push('/admin');
        } catch (error: any) {
            console.error("Registration error:", error);
            if (error.code === 'auth/email-already-in-use') {
                setError('Cet email est déjà utilisé.');
            } else if (error.code === 'auth/weak-password') {
                setError('Le mot de passe est trop faible.');
            } else {
                setError('Erreur lors de l\'inscription. Veuillez réessayer.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        
        if (accessCode !== PROF_ACCESS_CODE) {
            setError('Code d\'accès professeur invalide.');
            return;
        }

        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const userCredential = await signInWithPopup(auth, provider);
            
            // Toujours créer le profil avec le rôle prof pour cette page
            await createUserProfile(userCredential.user, 'prof');
            
            // Créer le cookie de session avant de rediriger
            await createSessionCookie(userCredential.user);
            router.push('/admin');
        } catch (error: any) {
            console.error("Google sign-in error:", error);
            setError('Erreur lors de la connexion avec Google.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Inscription Professeur
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Créez votre compte professeur avec le code d'accès fourni
                    </p>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-8">
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-1">
                                    Code d'accès professeur *
                                </label>
                                <input
                                    id="accessCode"
                                    type="text"
                                    required
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Code fourni par l'administration"
                                />
                            </div>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom complet
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Prof. Martin Dupont"
                                />
                            </div>
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
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Minimum 6 caractères"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Confirmez votre mot de passe"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Inscription en cours...' : "S'inscrire comme Professeur"}
                        </button>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            S'inscrire avec Google
                        </button>

                        <div className="text-center space-y-2">
                            <p className="text-sm text-gray-600">
                                Déjà un compte ?{' '}
                                <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                                    Se connecter
                                </Link>
                            </p>
                            <p className="text-sm text-gray-600">
                                Vous êtes élève ?{' '}
                                <Link href="/register/eleve" className="text-green-600 hover:text-green-500 font-medium">
                                    Inscription Élève
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
