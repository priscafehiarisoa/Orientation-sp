import { ReponseUtilisateur, ScoreSpecialite, Specialite } from '@/types/questionnaire';
import { questions } from '@/data/questions';

/**
 * Calcule les scores pour chaque spécialité basé sur les réponses de l'utilisateur
 */
export function calculerScores(
  reponses: ReponseUtilisateur[],
  specialitesFromCollection?: Specialite[]
): ScoreSpecialite[] {
  const specialites = (specialitesFromCollection && specialitesFromCollection.length > 0)
    ? specialitesFromCollection
    : Array.from(
        new Set(
          questions.flatMap(question => question.specialites)
        )
      );

  const scores = specialites.reduce((acc, spec) => {
    acc[spec] = 0;
    return acc;
  }, {} as Record<Specialite, number>);

  const scoresMax = specialites.reduce((acc, spec) => {
    acc[spec] = 0;
    return acc;
  }, {} as Record<Specialite, number>);

  // Parcourir toutes les questions pour calculer le score max
  questions.forEach(question => {
    question.specialites.forEach(spec => {
      scoresMax[spec] += 5 * question.poids; // Score max = 5 (J'adore) * poids
    });
  });

  // Calculer les scores basés sur les réponses
  reponses.forEach(reponse => {
    const question = questions.find(q => q.id === reponse.questionId);
    if (!question) return;

    question.specialites.forEach(spec => {
      scores[spec] += reponse.score * question.poids;
    });
  });

  // Convertir en tableau et calculer les pourcentages
  const resultats: ScoreSpecialite[] = (Object.keys(scores) as Specialite[]).map(specialite => ({
    specialite,
    score: scores[specialite],
    pourcentage: Math.round((scores[specialite] / scoresMax[specialite]) * 100)
  }));

  // Trier par pourcentage décroissant (et par score en cas d'égalité)
  resultats.sort((a, b) => {
    if (b.pourcentage !== a.pourcentage) {
      return b.pourcentage - a.pourcentage;
    }
    return b.score - a.score;
  });

  return resultats;
}

/**
 * Obtient les top N spécialités recommandées
 */
export function getTopSpecialites(scores: ScoreSpecialite[], n: number = 3): ScoreSpecialite[] {
  return scores.slice(0, n);
}

/**
 * Génère un message d'explication personnalisé
 */
export function genererExplication(topSpecialites: ScoreSpecialite[]): string {
  const top1 = topSpecialites[0];
  const top2 = topSpecialites[1];
  const top3 = topSpecialites[2];

  if (!top1) return '';

  let explication = `Tes réponses révèlent un fort intérêt pour **${top1.specialite}** (${top1.pourcentage}% de compatibilité). `;

  if (top2 && top2.pourcentage >= 70) {
    explication += `Tu as également montré un bon intérêt pour **${top2.specialite}** (${top2.pourcentage}%), ce qui pourrait former une excellente combinaison. `;
  }

  if (top3 && top3.pourcentage >= 65) {
    explication += `**${top3.specialite}** (${top3.pourcentage}%) pourrait aussi te convenir comme troisième spécialité.`;
  }

  return explication;
}
