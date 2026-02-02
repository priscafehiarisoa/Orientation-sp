import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const clientCredentials = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Vérification de la configuration
console.log('Firebase Config:', {
    apiKey: clientCredentials.apiKey ? '✓' : '✗',
    authDomain: clientCredentials.authDomain ? '✓' : '✗',
    projectId: clientCredentials.projectId ? '✓' : '✗',
    storageBucket: clientCredentials.storageBucket ? '✓' : '✗',
    messagingSenderId: clientCredentials.messagingSenderId ? '✓' : '✗',
    appId: clientCredentials.appId ? '✓' : '✗',
});

// Évite l'initialisation multiple
const app = getApps().length === 0 ? initializeApp(clientCredentials) : getApps()[0];
console.log('Firebase initialized:', !!app);

// Analytics uniquement côté client et en production
let analytics;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    try {
        analytics = getAnalytics(app);
    } catch (error) {
        console.log('Analytics not available:', error);
    }
}

export const auth = getAuth(app);
export const db = getFirestore(app);

// Configurer la persistance
if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence)
        .then(() => {
            console.log('Auth persistence configured');
        })
        .catch((error) => {
            console.error('Error setting persistence:', error);
        });
}
