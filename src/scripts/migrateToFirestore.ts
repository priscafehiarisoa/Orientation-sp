/**
 * Script de migration pour importer les questions et spécialités dans Firestore
 * 
 * UTILISATION:
 * 1. Assurez-vous d'être connecté en tant que professeur
 * 2. Accédez à /admin/migrate dans le navigateur
 * 3. Cliquez sur les boutons de migration
 */

import { createQuestion } from '@/services/questionService';
import { createSpecialite } from '@/services/specialiteService';
import { questions as hardcodedQuestions } from '@/data/questions';
import { specialitesInfo } from '@/types/questionnaire';
import { Timestamp } from 'firebase/firestore';

/**
 * Migrer toutes les questions vers Firestore
 */
export const migrateQuestions = async () => {
  const results = {
    success: 0,
    errors: [] as string[]
  };

  for (const question of hardcodedQuestions) {
    try {
      await createQuestion({
        text: question.text,
        specialites: question.specialites,
        poids: question.poids,
        actif: true
      });
      results.success++;
      console.log(`✓ Question migrée: ${question.text.substring(0, 50)}...`);
    } catch (error) {
      results.errors.push(`Question "${question.text}": ${error}`);
      console.error(`✗ Erreur migration question ${question.id}:`, error);
    }
  }

  return results;
};

/**
 * Migrer toutes les spécialités vers Firestore
 */
export const migrateSpecialites = async () => {
  const results = {
    success: 0,
    errors: [] as string[]
  };

  for (const [key, info] of Object.entries(specialitesInfo)) {
    try {
      await createSpecialite({
        nom: info.nom,
        emoji: info.emoji,
        couleur: info.couleur,
        description: info.description,
        metiers: info.metiers,
        etudes: info.etudes,
        actif: true
      });
      results.success++;
      console.log(`✓ Spécialité migrée: ${info.nom}`);
    } catch (error) {
      results.errors.push(`Spécialité "${key}": ${error}`);
      console.error(`✗ Erreur migration spécialité ${key}:`, error);
    }
  }

  return results;
};

/**
 * Fonction utilitaire pour vérifier si les données existent déjà
 */
export const checkMigrationStatus = async () => {
  // Cette fonction peut être implémentée pour vérifier
  // si les collections sont déjà remplies
  return {
    questionsCount: 0,
    specialitesCount: 0,
    needsMigration: true
  };
};
