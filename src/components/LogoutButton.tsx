'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {auth} from "@/firebase/ClientApp";

export default function LogoutButton(){
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const handleLogout = async ()=>{
        try{
            await auth.signOut();
            router.push('/login');
        }
        catch (e) {
            setError('Erreur lors de la déconnexion.');
            console.error("Logout error:", e);
        }

    };

    return (

        <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
            Déconnexion
        </button>
    );
}