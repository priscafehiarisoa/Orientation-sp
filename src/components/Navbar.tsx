'use client';

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/ClientApp";
import { useUserProfile } from "@/hooks/useUserProfile";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
    const [user, loading] = useAuthState(auth);
    const { profile, loading: loadingProfile } = useUserProfile(user);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Éviter l'hydration mismatch en ne rendant qu'après le montage côté client
    if (!isMounted) {
        return (
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <span className="text-3xl">🧠</span>
                            <span className="font-bold text-xl text-blue-600">Chemins de Spé</span>
                        </Link>
                        <div className="flex items-center gap-6">
                            <div className="text-sm text-gray-500">Chargement...</div>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    {/* Logo et titre */}
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <span className="text-3xl">🧠</span>
                        <span className="font-bold text-xl text-blue-600">Chemins de Spé</span>
                    </Link>

                    {/* Menu de navigation */}
                    <div className="flex items-center gap-6">
                        {loading || loadingProfile ? (
                            <div className="text-sm text-gray-500">Chargement...</div>
                        ) : user ? (
                            // Utilisateur connecté
                            <>
                                <Link 
                                    href="/dashboard" 
                                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    Dashboard
                                </Link>
                                
                                {profile?.role === 'prof' && (
                                    <Link 
                                        href="/admin" 
                                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                    >
                                        Administration
                                    </Link>
                                )}
                                
                                {/* <Link 
                                    href="/questionnaire" 
                                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    Questionnaire
                                </Link> */}

                                {/* <Link 
                                    href="/mes-resultats" 
                                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    Mes Résultats
                                </Link> */}

                                <div className="flex items-center gap-3 border-l border-gray-300 pl-6">
                                    <div className="text-sm">
                                        <p className="font-semibold text-gray-700">
                                            {user.displayName || user.email}
                                        </p>
                                        {profile && (
                                            <p className="text-xs text-gray-500">
                                                {profile.role === 'prof' ? '👨‍🏫 Professeur' : '🎓 Élève'}
                                            </p>
                                        )}
                                    </div>
                                    <LogoutButton />
                                </div>
                            </>
                        ) : (
                            // Utilisateur non connecté
                            <>
                                {/* <Link 
                                    href="/questionnaire" 
                                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    Questionnaire
                                </Link> */}
                                <Link 
                                    href="/login" 
                                    className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    Se connecter
                                </Link>
                                <Link 
                                    href="/register/eleve" 
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all"
                                >
                                    S'inscrire
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
