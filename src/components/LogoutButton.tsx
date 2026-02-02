'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {auth} from "@/firebase/ClientApp";
import { IconHourglass, IconLogout } from '@tabler/icons-react';

export default function LogoutButton(){
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    
    const handleLogout = async ()=>{
        setIsLoading(true);
        try{
            // Supprimer le cookie de session
            await fetch('/api/auth/session', {
                method: 'DELETE',
            });
            // Déconnecter de Firebase
            await auth.signOut();
            router.push('/');
        }
        catch (e) {
            console.error("Logout error:", e);
            alert('Erreur lors de la déconnexion.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <>
                    <span className="animate-spin"><IconHourglass size={24} className="inline-block" /></span>
                    <span>Déconnexion...</span>
                </>
            ) : (
                <>
                    <span><IconLogout size={24} className="inline-block" /></span>
                    <span>Déconnexion</span>
                </>
            )}
        </button>
    );
}