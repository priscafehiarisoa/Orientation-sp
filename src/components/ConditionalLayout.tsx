'use client';

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/ClientApp";
import LogoutButton from "@/components/LogoutButton";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const [user, loading] = useAuthState(auth);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (user) {
        // Layout pour utilisateur connecté
        return (
            <div className="min-h-screen bg-gray-100">
                <nav className="bg-white shadow p-4 text-blue-500">
                    <div className="container mx-auto flex justify-between">
                        <h1>Dashboard</h1>
                        <p>{user.email}</p>
                        <LogoutButton></LogoutButton>
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