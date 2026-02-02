import { db } from '@/firebase/ClientApp';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { ReponseUtilisateur, ScoreSpecialite } from '@/types/questionnaire';

export interface ResultatQuestionnaire {
  userId: string;
  userEmail: string;
  userName: string;
  classe: 'seconde' | 'premiere' | null;
  date: Timestamp;
  reponses: ReponseUtilisateur[];
  scores: ScoreSpecialite[];
  topSpecialites: ScoreSpecialite[];
  dureeQuestionnaire?: number;
}

/**
 * Sauvegarde un résultat de questionnaire dans Firestore
 */
export async function sauvegarderResultat(
  userId: string,
  userEmail: string,
  userName: string,
  classe: 'seconde' | 'premiere' | null,
  reponses: ReponseUtilisateur[],
  scores: ScoreSpecialite[],
  topSpecialites: ScoreSpecialite[],
  duree?: number
): Promise<string> {
  try {
    const timestamp = Date.now();
    const resultatId = `${userId}_${timestamp}`;
    const resultatRef = doc(db, 'resultats_questionnaires', resultatId);

    const data: ResultatQuestionnaire = {
      userId,
      userEmail,
      userName,
      classe,
      date: Timestamp.now(),
      reponses,
      scores,
      topSpecialites,
      dureeQuestionnaire: duree
    };

    await setDoc(resultatRef, data);
    console.log('✅ Résultat sauvegardé:', resultatId);
    return resultatId;
  } catch (error) {
    console.error('❌ Erreur sauvegarde résultat:', error);
    throw error;
  }
}

/**
 * Récupère tous les résultats d'un utilisateur
 */
export async function getResultatsUtilisateur(userId: string): Promise<ResultatQuestionnaire[]> {
  try {
    const resultatsRef = collection(db, 'resultats_questionnaires');
    const q = query(
      resultatsRef,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const resultats: ResultatQuestionnaire[] = [];

    querySnapshot.forEach((doc) => {
      resultats.push(doc.data() as ResultatQuestionnaire);
    });

    return resultats;
  } catch (error) {
    console.error('❌ Erreur récupération résultats:', error);
    throw error;
  }
}

/**
 * Récupère un résultat spécifique
 */
export async function getResultat(resultatId: string): Promise<ResultatQuestionnaire | null> {
  try {
    const resultatRef = doc(db, 'resultats_questionnaires', resultatId);
    const resultatSnap = await getDoc(resultatRef);

    if (resultatSnap.exists()) {
      return resultatSnap.data() as ResultatQuestionnaire;
    }
    return null;
  } catch (error) {
    console.error('❌ Erreur récupération résultat:', error);
    throw error;
  }
}

/**
 * Récupère tous les résultats (pour les profs)
 */
export async function getTousLesResultats(): Promise<ResultatQuestionnaire[]> {
  try {
    const resultatsRef = collection(db, 'resultats_questionnaires');
    const q = query(resultatsRef, orderBy('date', 'desc'));

    const querySnapshot = await getDocs(q);
    const resultats: ResultatQuestionnaire[] = [];

    querySnapshot.forEach((doc) => {
      resultats.push(doc.data() as ResultatQuestionnaire);
    });

    return resultats;
  } catch (error) {
    console.error('❌ Erreur récupération tous les résultats:', error);
    throw error;
  }
}

/**
 * Récupère les statistiques globales
 */
export async function getStatistiquesGlobales(): Promise<{
  totalParticipants: number;
  totalQuestionnaires: number;
  participantsParClasse: Record<string, number>;
  specialitesPlusChoisies: Array<{ specialite: string; count: number }>;
}> {
  try {
    const resultats = await getTousLesResultats();

    const elevesUniques = new Set(resultats.map(r => r.userId));
    const distributionSpecialites: Record<string, Set<string>> = {};
    const participantsParClasse: Record<string, Set<string>> = {};

    // Garder le dernier résultat de chaque élève (le plus récent)
    const derniersResultatsParEleve = new Map<string, ResultatQuestionnaire>();
    resultats.forEach((resultat) => {
      const existing = derniersResultatsParEleve.get(resultat.userId);
      if (!existing || resultat.date.toMillis() > existing.date.toMillis()) {
        derniersResultatsParEleve.set(resultat.userId, resultat);
      }
    });

    // Utiliser uniquement les derniers résultats pour les statistiques
    derniersResultatsParEleve.forEach((resultat) => {
      // Distribution des spécialités (top 1 de chaque élève)
      if (resultat.topSpecialites && resultat.topSpecialites.length > 0) {
        const topSpec = resultat.topSpecialites[0].specialite;
        if (!distributionSpecialites[topSpec]) {
          distributionSpecialites[topSpec] = new Set();
        }
        distributionSpecialites[topSpec].add(resultat.userId);
      }

      // Distribution des classes (élèves uniques par classe)
      const classeName = resultat.classe || 'Non renseignée';
      if (!participantsParClasse[classeName]) {
        participantsParClasse[classeName] = new Set();
      }
      participantsParClasse[classeName].add(resultat.userId);
    });

    // Convertir les Sets en nombres
    const participantsParClasseCount: Record<string, number> = {};
    Object.entries(participantsParClasse).forEach(([classe, userIds]) => {
      participantsParClasseCount[classe] = userIds.size;
    });

    // Convertir distributionSpecialites en tableau trié
    const specialitesPlusChoisies = Object.entries(distributionSpecialites)
      .map(([specialite, userIds]) => ({ specialite, count: userIds.size }))
      .sort((a, b) => b.count - a.count);

    return {
      totalParticipants: elevesUniques.size,
      totalQuestionnaires: resultats.length,
      participantsParClasse: participantsParClasseCount,
      specialitesPlusChoisies
    };
  } catch (error) {
    console.error('❌ Erreur calcul statistiques:', error);
    throw error;
  }
}
