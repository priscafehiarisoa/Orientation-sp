import { db } from '@/firebase/ClientApp';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

export interface Classe {
  id?: string;
  nom: string; // Ex: "Seconde A", "Première S1", "Terminale STI2D"
  niveau: 'Seconde' | 'Première' | 'Terminale';
  specialite?: string; // Ex: "Générale", "STI2D", "STMG", etc.
  annee: string; // Ex: "2025-2026"
  actif: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const CLASSES_COLLECTION = 'classes';

/**
 * Récupérer toutes les classes
 */
export async function getAllClasses(): Promise<Classe[]> {
  try {
    const q = query(collection(db, CLASSES_COLLECTION), orderBy('niveau'), orderBy('nom'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Classe));
  } catch (error) {
    console.error('Erreur récupération classes:', error);
    throw error;
  }
}

/**
 * Récupérer les classes actives seulement
 */
export async function getActiveClasses(): Promise<Classe[]> {
  try {
    const classes = await getAllClasses();
    return classes.filter(c => c.actif);
  } catch (error) {
    console.error('Erreur récupération classes actives:', error);
    throw error;
  }
}

/**
 * Créer une nouvelle classe
 */
export async function createClasse(classe: Omit<Classe, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, CLASSES_COLLECTION), {
      ...classe,
      createdAt: now,
      updatedAt: now
    });
    
    console.log('Classe créée avec ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erreur création classe:', error);
    throw error;
  }
}

/**
 * Modifier une classe existante
 */
export async function updateClasse(classeId: string, updates: Partial<Classe>): Promise<void> {
  try {
    const classeRef = doc(db, CLASSES_COLLECTION, classeId);
    await updateDoc(classeRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    console.log('Classe mise à jour:', classeId);
  } catch (error) {
    console.error('Erreur mise à jour classe:', error);
    throw error;
  }
}

/**
 * Supprimer une classe
 */
export async function deleteClasse(classeId: string): Promise<void> {
  try {
    const classeRef = doc(db, CLASSES_COLLECTION, classeId);
    await deleteDoc(classeRef);
    
    console.log('Classe supprimée:', classeId);
  } catch (error) {
    console.error('Erreur suppression classe:', error);
    throw error;
  }
}

/**
 * Archiver une classe (la marquer comme inactive)
 */
export async function archiveClasse(classeId: string): Promise<void> {
  try {
    await updateClasse(classeId, { actif: false });
    console.log('Classe archivée:', classeId);
  } catch (error) {
    console.error('Erreur archivage classe:', error);
    throw error;
  }
}
