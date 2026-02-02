import { db } from '@/firebase/ClientApp';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

/**
 * Script pour migrer les utilisateurs existants de Firebase Auth vers Firestore
 * 
 * ATTENTION : Ce script doit être exécuté une seule fois
 * Il crée les profils Firestore pour tous les utilisateurs existants
 * 
 * Par défaut, tous les utilisateurs existants seront créés avec le rôle 'eleve'
 * Vous devrez manuellement changer le rôle en 'prof' pour les professeurs
 */

export interface MigrationUser {
    uid: string;
    email: string;
    displayName: string;
    role: 'prof' | 'eleve';
}

/**
 * Migre un utilisateur unique vers Firestore
 */
export async function migrateUser(user: MigrationUser): Promise<void> {
    try {
        const userRef = doc(db, 'users', user.uid);
        
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            createdAt: new Date(),
            updatedAt: new Date(),
            migrated: true, // Flag pour savoir qu'il s'agit d'un utilisateur migré
        }, { merge: true });

        console.log(` User ${user.email} migrated successfully`);
    } catch (error) {
        console.error(` Error migrating user ${user.email}:`, error);
        throw error;
    }
}

/**
 * Migre tous les utilisateurs d'une liste
 */
export async function migrateMultipleUsers(users: MigrationUser[]): Promise<void> {
    console.log(`Starting migration of ${users.length} users...`);
    
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
        try {
            await migrateUser(user);
            successCount++;
        } catch (error) {
            errorCount++;
        }
    }

    console.log(`\n Migration completed:`);
    console.log(` Success: ${successCount}`);
    console.log(` Errors: ${errorCount}`);
}

/**
 * Vérifie si un utilisateur existe déjà dans Firestore
 */
export async function checkIfUserExists(uid: string): Promise<boolean> {
    try {
        const userRef = doc(db, 'users', uid);
        const snapshot = await getDocs(collection(db, 'users'));
        return snapshot.docs.some(doc => doc.id === uid);
    } catch (error) {
        console.error('Error checking user existence:', error);
        return false;
    }
}
