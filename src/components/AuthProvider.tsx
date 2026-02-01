'use client';

import { useEffect } from 'react';
import { auth } from '@/firebase/ClientApp';
import { onAuthStateChanged } from 'firebase/auth';
import ConditionalLayout from "@/components/ConditionalLayout";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken();
                await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });
            } else {
                await fetch('/api/auth/session', { method: 'DELETE' });
            }
        });

        return () => unsubscribe();
    }, []);

    return <>{children}</>;
}
