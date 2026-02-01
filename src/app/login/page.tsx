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

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [error, setError] = useState('');

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
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Créer le cookie de session avant de rediriger
            await createSessionCookie(userCredential.user);
            router.push('/dashboard');
        } catch (error: any) {
            setError('Email ou mot de passe incorrect.');
            console.error("Authentication error:", error);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            const userCredential = await signInWithPopup(auth, provider);
            // Créer le cookie de session avant de rediriger
            await createSessionCookie(userCredential.user);
            router.push('/dashboard');
        } catch (error: any) {
            setError('Erreur lors de la connexion avec Google.');
            console.error("Google sign-in error:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Connexion
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Connectez-vous à votre compte
                    </p>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-8">
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Se connecter
                        </button>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Se connecter avec Google
                        </button>

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
                                <Link 
                                    href="/register/prof"
                                    className="flex-1 py-2 px-4 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                                >
                                    Inscription Prof
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
