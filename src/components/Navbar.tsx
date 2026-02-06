'use client';

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/ClientApp";
import { useUserProfile } from "@/hooks/useUserProfile";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { IconMenu2, IconX } from "@tabler/icons-react";

export default function Navbar() {
    const [user, loading] = useAuthState(auth);
    const { profile, loading: loadingProfile } = useUserProfile(user);
    const [isMounted, setIsMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

                    {/* Bouton hamburger (mobile) */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="Menu"
                    >
                        {mobileMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
                    </button>

                    {/* Menu desktop */}
                    <div className="hidden md:flex items-center gap-6">
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

                {/* Menu mobile */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
                        {loading || loadingProfile ? (
                            <div className="text-sm text-gray-500 py-2">Chargement...</div>
                        ) : user ? (
                            // Utilisateur connecté - Mobile
                            <div className="flex flex-col gap-3">
                                <div className="pb-3 border-b border-gray-200">
                                    <p className="font-semibold text-gray-700">
                                        {user.displayName || user.email}
                                    </p>
                                    {profile && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {profile.role === 'prof' ? '👨‍🏫 Professeur' : '🎓 Élève'}
                                        </p>
                                    )}
                                </div>
                                
                                <Link 
                                    href="/dashboard" 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-4 py-3 text-blue-600 hover:bg-blue-50 font-medium transition-colors rounded-lg"
                                >
                                    Dashboard
                                </Link>
                                
                                {profile?.role === 'prof' && (
                                    <Link 
                                        href="/admin" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-4 py-3 text-blue-600 hover:bg-blue-50 font-medium transition-colors rounded-lg"
                                    >
                                        Administration
                                    </Link>
                                )}

                                <div className="pt-3 border-t border-gray-200">
                                    <LogoutButton />
                                </div>
                            </div>
                        ) : (
                            // Utilisateur non connecté - Mobile
                            <div className="flex flex-col gap-3">
                                <Link 
                                    href="/login" 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-4 py-3 text-center text-blue-600 hover:bg-blue-50 font-medium transition-colors rounded-lg"
                                >
                                    Se connecter
                                </Link>
                                <Link 
                                    href="/register/eleve" 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-4 py-3 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all"
                                >
                                    S'inscrire
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
