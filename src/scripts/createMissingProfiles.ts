/**
 * Script pour créer les profils Firestore manquants
 * À exécuter dans la console du navigateur
 */

import { auth, db } from '@/firebase/ClientApp';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export async function createMissingProfile() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.error('❌ Aucun utilisateur connecté');
        reject('No user logged in');
        return;
      }

      console.log('✅ Utilisateur Firebase Auth:', user.uid, user.email);

      // Vérifier si le profil existe
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log('✅ Profil Firestore existe déjà:', userSnap.data());
        resolve(userSnap.data());
        return;
      }

      console.log('⚠️ Profil Firestore manquant, création en cours...');

      // Créer le profil manquant
      const newProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
        role: 'eleve', // Changez en 'prof' si nécessaire
        classe: null,
        age: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      try {
        await setDoc(userRef, newProfile);
        console.log('✅ Profil Firestore créé avec succès:', newProfile);
        resolve(newProfile);
      } catch (error) {
        console.error('❌ Erreur création profil:', error);
        reject(error);
      }
    });
  });
}

// Pour utiliser dans la console :
// import { createMissingProfile } from '@/scripts/createMissingProfiles';
// createMissingProfile();
