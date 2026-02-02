import { db } from '@/firebase/ClientApp';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { Specialite } from '@/types/questionnaire';

export interface Question {
  id?: string;
  text: string;
  specialites: Specialite[];
  poids: number; // 1-3
  actif: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const QUESTIONS_COLLECTION = 'questions';

/**
 * Récupérer toutes les questions
 */
export async function getAllQuestions(): Promise<Question[]> {
  try {
    const q = query(collection(db, QUESTIONS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Question));
  } catch (error) {
    console.error('Erreur récupération questions:', error);
    throw error;
  }
}

/**
 * Récupérer les questions actives seulement
 */
export async function getActiveQuestions(): Promise<Question[]> {
  try {
    const questions = await getAllQuestions();
    return questions.filter(q => q.actif);
  } catch (error) {
    console.error('Erreur récupération questions actives:', error);
    throw error;
  }
}

/**
 * Créer une nouvelle question
 */
export async function createQuestion(question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, QUESTIONS_COLLECTION), {
      ...question,
      createdAt: now,
      updatedAt: now
    });
    
    console.log('Question créée avec ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erreur création question:', error);
    throw error;
  }
}

/**
 * Modifier une question existante
 */
export async function updateQuestion(questionId: string, updates: Partial<Question>): Promise<void> {
  try {
    const questionRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await updateDoc(questionRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    console.log('Question mise à jour:', questionId);
  } catch (error) {
    console.error('Erreur mise à jour question:', error);
    throw error;
  }
}

/**
 * Supprimer une question
 */
export async function deleteQuestion(questionId: string): Promise<void> {
  try {
    const questionRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await deleteDoc(questionRef);
    
    console.log('Question supprimée:', questionId);
  } catch (error) {
    console.error('Erreur suppression question:', error);
    throw error;
  }
}

/**
 * Archiver une question (la rendre inactive)
 */
export async function archiveQuestion(questionId: string): Promise<void> {
  try {
    await updateQuestion(questionId, { actif: false });
    console.log('Question archivée:', questionId);
  } catch (error) {
    console.error('Erreur archivage question:', error);
    throw error;
  }
}
