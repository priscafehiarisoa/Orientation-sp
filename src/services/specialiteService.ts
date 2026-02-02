import { db } from '@/firebase/ClientApp';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

export interface SpecialiteInfo {
  id?: string;
  nom: string;
  emoji: string;
  couleur: string; // Hex color
  description: string;
  metiers: string[];
  etudes: string[];
  actif: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const SPECIALITES_COLLECTION = 'specialites';

/**
 * Récupérer toutes les spécialités
 */
export async function getAllSpecialites(): Promise<SpecialiteInfo[]> {
  try {
    const q = query(collection(db, SPECIALITES_COLLECTION), orderBy('nom'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SpecialiteInfo));
  } catch (error) {
    console.error('Erreur récupération spécialités:', error);
    throw error;
  }
}

/**
 * Récupérer les spécialités actives seulement
 */
export async function getActiveSpecialites(): Promise<SpecialiteInfo[]> {
  try {
    const specialites = await getAllSpecialites();
    return specialites.filter(s => s.actif);
  } catch (error) {
    console.error('Erreur récupération spécialités actives:', error);
    throw error;
  }
}

/**
 * Créer une nouvelle spécialité
 */
export async function createSpecialite(specialite: Omit<SpecialiteInfo, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, SPECIALITES_COLLECTION), {
      ...specialite,
      createdAt: now,
      updatedAt: now
    });
    
    console.log('Spécialité créée avec ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erreur création spécialité:', error);
    throw error;
  }
}

/**
 * Modifier une spécialité existante
 */
export async function updateSpecialite(specialiteId: string, updates: Partial<SpecialiteInfo>): Promise<void> {
  try {
    const specialiteRef = doc(db, SPECIALITES_COLLECTION, specialiteId);
    await updateDoc(specialiteRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    console.log('Spécialité mise à jour:', specialiteId);
  } catch (error) {
    console.error('Erreur mise à jour spécialité:', error);
    throw error;
  }
}

/**
 * Supprimer une spécialité
 */
export async function deleteSpecialite(specialiteId: string): Promise<void> {
  try {
    const specialiteRef = doc(db, SPECIALITES_COLLECTION, specialiteId);
    await deleteDoc(specialiteRef);
    
    console.log('Spécialité supprimée:', specialiteId);
  } catch (error) {
    console.error('Erreur suppression spécialité:', error);
    throw error;
  }
}

/**
 * Archiver une spécialité (la rendre inactive)
 */
export async function archiveSpecialite(specialiteId: string): Promise<void> {
  try {
    await updateSpecialite(specialiteId, { actif: false });
    console.log('Spécialité archivée:', specialiteId);
  } catch (error) {
    console.error('Erreur archivage spécialité:', error);
    throw error;
  }
}
