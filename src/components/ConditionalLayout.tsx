'use client';

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/ClientApp";
import LogoutButton from "@/components/LogoutButton";
import { useUserProfile } from "@/hooks/useUserProfile";
import Link from "next/link";
import { IconUser } from "@tabler/icons-react";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const [user, loading] = useAuthState(auth);
    const { profile, loading: loadingProfile } = useUserProfile(user);

    if (loading || loadingProfile) {
        return <div>Loading...</div>;
    }

    if (user) {
        // Layout pour utilisateur connecté
        return (
            <div className="min-h-screen bg-gray-100">
                <nav className="bg-white shadow p-4 text-blue-500">
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="flex items-center space-x-6">
                            <Link href="/dashboard" className="font-bold text-lg hover:text-blue-700">
                                Dashboard
                            </Link>
                            {profile?.role === 'prof' && (
                                <Link href="/admin" className="hover:text-blue-700">
                                    Administration
                                </Link>
                            )}
                            {profile?.role === 'eleve' && (
                                <Link href="/questionnaires" className="hover:text-blue-700">
                                    Questionnaires
                                </Link>
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link 
                                href="/profile" 
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-medium flex items-center gap-2"
                                title="Mon profil"
                            >
                                <span><IconUser size={24} /></span>
                                <span className="hidden md:inline">Mon Profil</span>
                            </Link>
                            <div className="text-sm">
                                <p className="font-semibold">{user.displayName || user.email}</p>
                                {profile && (
                                    <p className="text-xs text-gray-600">
                                        {profile.role === 'prof' ? 'Professeur' : 'Élève'}
                                    </p>
                                )}
                            </div>
                            <LogoutButton />
                        </div>
                    </div>
                </nav>
                <main className="container mx-auto p-8">
                    {children}
                </main>
            </div>
        );
    }

    // Layout pour utilisateur non connecté
    return (
        <div className="min-h-screen bg-zinc-50">
            <main className="container mx-auto p-8">
                {children}
            </main>
        </div>
    );
}