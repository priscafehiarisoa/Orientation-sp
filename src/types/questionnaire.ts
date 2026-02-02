// Types pour l'application Chemins de Spé

export type Specialite = 
  | 'Maths'
  | 'Physique'
  | 'SVT'
  | 'SES'
  | 'NSI'
  | 'HGSP'
  | 'HLP'
  | 'LLCE';

export interface Question {
  id: string;
  text: string;
  specialites: Specialite[]; // Spécialités auxquelles cette question contribue
  poids: number; // Poids de la question (1-3)
}

export interface ReponseUtilisateur {
  questionId: string;
  score: number; // 1 à 5 (échelle de Likert)
}

export interface ScoreSpecialite {
  specialite: Specialite;
  score: number;
  pourcentage: number;
}

export interface ResultatQuestionnaire {
  userId: string;
  date: Date;
  reponses: ReponseUtilisateur[];
  scores: ScoreSpecialite[];
  topSpecialites: ScoreSpecialite[];
}

export interface SpecialiteInfo {
  nom: Specialite;
  emoji: string;
  couleur: string;
  description: string;
  metiers: string[];
  etudes: string[];
  salaireMoyen: string;
}

export const specialitesInfo: Record<Specialite, SpecialiteInfo> = {
  Maths: {
    nom: 'Maths',
    emoji: '📐',
    couleur: '#3B82F6', // Bleu
    description: 'Sciences mathématiques et raisonnement logique',
    metiers: ['Ingénieur', 'Actuaire', 'Data Scientist', 'Professeur de maths'],
    etudes: ['Classes préparatoires scientifiques', 'École d\'ingénieurs', 'Licence de mathématiques'],
    salaireMoyen: '35 000 - 60 000€/an'
  },
  Physique: {
    nom: 'Physique',
    emoji: '⚛️',
    couleur: '#8B5CF6', // Violet
    description: 'Physique-Chimie et sciences expérimentales',
    metiers: ['Ingénieur', 'Chercheur', 'Technicien de laboratoire', 'Pharmacien'],
    etudes: ['Classes préparatoires', 'École d\'ingénieurs', 'Licence de physique'],
    salaireMoyen: '32 000 - 55 000€/an'
  },
  SVT: {
    nom: 'SVT',
    emoji: '🧬',
    couleur: '#10B981', // Vert
    description: 'Sciences de la Vie et de la Terre',
    metiers: ['Médecin', 'Biologiste', 'Vétérinaire', 'Ingénieur agronome'],
    etudes: ['Médecine', 'Pharmacie', 'Licence de biologie', 'École vétérinaire'],
    salaireMoyen: '30 000 - 70 000€/an'
  },
  SES: {
    nom: 'SES',
    emoji: '📊',
    couleur: '#F59E0B', // Orange
    description: 'Sciences Économiques et Sociales',
    metiers: ['Économiste', 'Consultant', 'Journaliste économique', 'Responsable RH'],
    etudes: ['Sciences Po', 'École de commerce', 'Licence d\'économie'],
    salaireMoyen: '32 000 - 65 000€/an'
  },
  NSI: {
    nom: 'NSI',
    emoji: '💻',
    couleur: '#06B6D4', // Cyan
    description: 'Numérique et Sciences Informatiques',
    metiers: ['Développeur', 'Ingénieur cybersécurité', 'Data Analyst', 'Chef de projet IT'],
    etudes: ['École d\'ingénieurs informatique', 'Licence informatique', 'IUT informatique'],
    salaireMoyen: '35 000 - 70 000€/an'
  },
  HGSP: {
    nom: 'HGSP',
    emoji: '🌍',
    couleur: '#EF4444', // Rouge
    description: 'Histoire-Géographie, Géopolitique et Sciences Politiques',
    metiers: ['Diplomate', 'Journaliste', 'Professeur', 'Analyste politique'],
    etudes: ['Sciences Po', 'Licence d\'histoire', 'Relations internationales'],
    salaireMoyen: '28 000 - 50 000€/an'
  },
  HLP: {
    nom: 'HLP',
    emoji: '📚',
    couleur: '#EC4899', // Rose
    description: 'Humanités, Littérature et Philosophie',
    metiers: ['Professeur', 'Écrivain', 'Éditeur', 'Journaliste culturel'],
    etudes: ['Licence de lettres', 'Licence de philosophie', 'Sciences Po'],
    salaireMoyen: '25 000 - 45 000€/an'
  },
  LLCE: {
    nom: 'LLCE',
    emoji: '🌐',
    couleur: '#14B8A6', // Teal
    description: 'Langues, Littératures et Cultures Étrangères',
    metiers: ['Traducteur', 'Professeur de langues', 'Diplomate', 'Guide touristique'],
    etudes: ['Licence LLCE', 'LEA', 'École d\'interprétariat', 'Relations internationales'],
    salaireMoyen: '26 000 - 48 000€/an'
  }
};
