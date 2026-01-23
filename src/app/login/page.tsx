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

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const router = useRouter();
    const [error, setError] = useState('');
    const [defaultConnectedLink, setDefaultConnectedLink] = useState('/');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredentials.user, {
                    displayName: name
                });
            }
            router.push(defaultConnectedLink);
        } catch (error:any) {
            setError('Email ou mot de passe incorrect.');
            console.error("Authentication error:", error);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push(defaultConnectedLink);
        } catch (error:any) {
            setError('Erreur lors de la connexion avec Google.');

            console.error("Google sign-in error:", error);
        }
    };


    return (
        <div className="container mx-auto px-4">
            <div className="shadow-amber-100">
                <div>
                    <h2 className="text-blue-500 text-center font-bold text-3xl italic">
                        {isLogin ? 'Connexion' : 'Inscription'}
                    </h2>
                </div>
                <div className="">
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm space-y-2">
                            {!isLogin && (
                            <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Nom complet"
                            />
                            )}
                            <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Email"
                            />
                            <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Mot de passe"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button
                                type="submit"
                                className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {isLogin ? 'Se connecter' : "S'inscrire"}
                        </button>

                        <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Se connecter avec Google
                        </button>

                        <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                        className="w-full text-sm text-indigo-600 hover:text-indigo-500"
                        >
                        {isLogin ? 'Créer un compte' : "J\\'ai déjà un compte"}
                        </button>
                    </form>
                </div>
            </div>

        </div>
    )
}