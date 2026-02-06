'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider, 
    updateProfile
} from "@firebase/auth";
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';

import {auth} from '../../../firebase/ClientApp';
import { createUserProfile } from '@/services/userService';
import { Classe, getActiveClasses } from '@/services/classeService';
import { IconSchool } from '@tabler/icons-react';

export default function RegisterElevePage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [selectedClasse, setSelectedClasse] = useState('');
    const [classes, setClasses] = useState<Classe[]>([]);
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [user, loadingAuth] = useAuthState(auth);

    // Client-side mounting check
    useEffect(() => {
        setMounted(true);
    }, []);

    // Redirection si déjà connecté
    useEffect(() => {
        if (!loadingAuth && user) {
            window.location.href = '/dashboard';
        }
    }, [user, loadingAuth, router]);

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        try {
            const fetchedClasses = await getActiveClasses();
            setClasses(fetchedClasses);
        } catch (error) {
            console.error('Erreur chargement classes:', error);
        }
    };

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
            
            // Récupérer le nom de la classe sélectionnée
            const selectedClasseObj = classes.find(c => c.id === selectedClasse);
            const classeName = selectedClasseObj?.nom || null;
            
            // Créer le profil utilisateur dans Firestore avec le rôle ELEVE et la classe
            await createUserProfile(userCredential.user, 'eleve', classeName);
            // Créer le cookie de session avant de rediriger
            await createSessionCookie(userCredential.user);
            console.log('Registration successful:', userCredential.user.email);
            
            // Forcer la redirection
            window.location.href = '/dashboard';
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
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const userCredential = await signInWithPopup(auth, provider);
            
            // Récupérer le nom de la classe sélectionnée
            const selectedClasseObj = classes.find(c => c.id === selectedClasse);
            const classeName = selectedClasseObj?.nom || null;
            
            await createUserProfile(userCredential.user, 'eleve', classeName);
            await createSessionCookie(userCredential.user);
            console.log('Google sign-up successful:', userCredential.user.email);
            
            // Forcer la redirection
            window.location.href = '/dashboard';
        } catch (error: any) {
            if (error.code === 'auth/popup-closed-by-user') {
                setError('Inscription annulée.');
            } else {
                setError('Erreur lors de l\'inscription avec Google.');
            }
            console.error("Google sign-in error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Afficher un écran de chargement pendant la vérification
    if (!mounted || loadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Vérification...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="flex justify-center mb-4">
                        <span className="text-6xl"><IconSchool size={48} stroke={1.5} /></span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Inscription Élève
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Créez votre compte élève pour accéder aux questionnaires
                    </p>
                </div>
                <div className="bg-white shadow-xl rounded-xl p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
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
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Jean Dupont"
                                />
                            </div>
                            <div>
                                <label htmlFor="classe" className="block text-sm font-medium text-gray-700 mb-1">
                                    Classe
                                </label>
                                <select
                                    id="classe"
                                    value={selectedClasse}
                                    onChange={(e) => setSelectedClasse(e.target.value)}
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">-- Sélectionnez votre classe (optionnel) --</option>
                                    {classes.map((classe) => (
                                        <option key={classe.id} value={classe.id}>
                                            {classe.nom} {classe.specialite && `(${classe.specialite})`}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Vous pourrez la modifier plus tard si nécessaire
                                </p>
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
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Confirmez votre mot de passe"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {loading ? 'Inscription en cours...' : "S'inscrire comme Élève"}
                        </button>

                        {/* <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            S'inscrire avec Google
                        </button> */}

                        <div className="text-center space-y-2">
                            <p className="text-sm text-gray-600">
                                Déjà un compte ?{' '}
                                <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                                    Se connecter
                                </Link>
                            </p>
                            {/* <p className="text-sm text-gray-600">
                                Vous êtes professeur ?{' '}
                                <Link href="/register/prof" className="text-blue-600 hover:text-blue-500 font-medium">
                                    Inscription Professeur
                                </Link>
                            </p> */}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
