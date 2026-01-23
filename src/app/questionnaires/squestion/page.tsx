'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider, updateProfile
} from "@firebase/auth";

import {auth} from '../../../firebase/ClientApp';

export default function sQuestion() {
    const router = useRouter();

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4">Bienvenue sur le Sous questions</h1>
            <p>Ceci est une page protégée accessible uniquement aux utilisateurs authentifiés.</p>
        </div>
    );
}