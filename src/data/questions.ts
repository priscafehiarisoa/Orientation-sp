import { Question } from '@/types/questionnaire';

export const questions: Question[] = [
  // Questions Maths (5 questions)
  {
    id: 'math_1',
    text: 'Résoudre des équations complexes',
    specialites: ['Maths'],
    poids: 3
  },
  {
    id: 'math_2',
    text: 'Analyser des données statistiques',
    specialites: ['Maths', 'SES'],
    poids: 2
  },
  {
    id: 'math_3',
    text: 'Démontrer des théorèmes mathématiques',
    specialites: ['Maths'],
    poids: 3
  },
  {
    id: 'math_4',
    text: 'Utiliser des logiciels de calcul',
    specialites: ['Maths', 'NSI'],
    poids: 2
  },
  {
    id: 'math_5',
    text: 'Résoudre des problèmes de géométrie dans l\'espace',
    specialites: ['Maths', 'Physique'],
    poids: 2
  },

  // Questions Physique-Chimie (5 questions)
  {
    id: 'phys_1',
    text: 'Expérimenter avec des circuits électriques',
    specialites: ['Physique'],
    poids: 3
  },
  {
    id: 'phys_2',
    text: 'Comprendre les lois de la mécanique',
    specialites: ['Physique'],
    poids: 3
  },
  {
    id: 'phys_3',
    text: 'Réaliser des expériences chimiques en laboratoire',
    specialites: ['Physique', 'SVT'],
    poids: 2
  },
  {
    id: 'phys_4',
    text: 'Analyser des phénomènes physiques du quotidien',
    specialites: ['Physique'],
    poids: 2
  },
  {
    id: 'phys_5',
    text: 'Étudier l\'énergie et les transformations',
    specialites: ['Physique'],
    poids: 2
  },

  // Questions SVT (5 questions)
  {
    id: 'svt_1',
    text: 'Étudier la biologie humaine et le fonctionnement du corps',
    specialites: ['SVT'],
    poids: 3
  },
  {
    id: 'svt_2',
    text: 'Analyser l\'impact du climat sur les écosystèmes',
    specialites: ['SVT', 'HGSP'],
    poids: 2
  },
  {
    id: 'svt_3',
    text: 'Observer des cellules au microscope',
    specialites: ['SVT'],
    poids: 3
  },
  {
    id: 'svt_4',
    text: 'Comprendre l\'évolution et la génétique',
    specialites: ['SVT'],
    poids: 3
  },
  {
    id: 'svt_5',
    text: 'Étudier la biodiversité et les espèces',
    specialites: ['SVT'],
    poids: 2
  },

  // Questions SES (5 questions)
  {
    id: 'ses_1',
    text: 'Débattre de politiques économiques',
    specialites: ['SES', 'HGSP'],
    poids: 3
  },
  {
    id: 'ses_2',
    text: 'Comprendre les inégalités sociales',
    specialites: ['SES', 'HGSP'],
    poids: 3
  },
  {
    id: 'ses_3',
    text: 'Analyser le comportement des consommateurs',
    specialites: ['SES'],
    poids: 2
  },
  {
    id: 'ses_4',
    text: 'Étudier les marchés financiers',
    specialites: ['SES', 'Maths'],
    poids: 2
  },
  {
    id: 'ses_5',
    text: 'Comprendre les enjeux de la mondialisation',
    specialites: ['SES', 'HGSP'],
    poids: 2
  },

  // Questions NSI (5 questions)
  {
    id: 'nsi_1',
    text: 'Programmer un petit logiciel ou application',
    specialites: ['NSI'],
    poids: 3
  },
  {
    id: 'nsi_2',
    text: 'Comprendre les algorithmes et l\'intelligence artificielle',
    specialites: ['NSI', 'Maths'],
    poids: 3
  },
  {
    id: 'nsi_3',
    text: 'Créer un site web ou une application mobile',
    specialites: ['NSI'],
    poids: 2
  },
  {
    id: 'nsi_4',
    text: 'Résoudre des problèmes informatiques complexes',
    specialites: ['NSI'],
    poids: 3
  },
  {
    id: 'nsi_5',
    text: 'Comprendre la cybersécurité et les réseaux',
    specialites: ['NSI'],
    poids: 2
  },

  // Questions HGSP (4 questions)
  {
    id: 'hgsp_1',
    text: 'Analyser des événements historiques majeurs',
    specialites: ['HGSP'],
    poids: 3
  },
  {
    id: 'hgsp_2',
    text: 'Étudier les relations internationales',
    specialites: ['HGSP'],
    poids: 3
  },
  {
    id: 'hgsp_3',
    text: 'Comprendre les enjeux géopolitiques actuels',
    specialites: ['HGSP', 'SES'],
    poids: 2
  },
  {
    id: 'hgsp_4',
    text: 'Débattre de questions politiques et sociales',
    specialites: ['HGSP', 'SES', 'HLP'],
    poids: 2
  },

  // Questions HLP (4 questions)
  {
    id: 'hlp_1',
    text: 'Débattre de questions philosophiques',
    specialites: ['HLP'],
    poids: 3
  },
  {
    id: 'hlp_2',
    text: 'Analyser des textes littéraires classiques',
    specialites: ['HLP', 'LLCE'],
    poids: 3
  },
  {
    id: 'hlp_3',
    text: 'Réfléchir sur des questions éthiques et morales',
    specialites: ['HLP'],
    poids: 3
  },
  {
    id: 'hlp_4',
    text: 'Écrire des dissertations argumentées',
    specialites: ['HLP', 'HGSP'],
    poids: 2
  },

  // Questions LLCE (4 questions)
  {
    id: 'llce_1',
    text: 'Lire des livres en anglais/espagnol/allemand',
    specialites: ['LLCE'],
    poids: 3
  },
  {
    id: 'llce_2',
    text: 'Étudier les cultures étrangères',
    specialites: ['LLCE', 'HGSP'],
    poids: 3
  },
  {
    id: 'llce_3',
    text: 'Traduire des textes d\'une langue à l\'autre',
    specialites: ['LLCE'],
    poids: 3
  },
  {
    id: 'llce_4',
    text: 'Regarder des films et séries en version originale',
    specialites: ['LLCE'],
    poids: 2
  },

  // Questions transversales (5 questions)
  {
    id: 'trans_1',
    text: 'Travailler en groupe sur des projets',
    specialites: ['SES', 'HGSP', 'NSI'],
    poids: 1
  },
  {
    id: 'trans_2',
    text: 'Faire des présentations orales',
    specialites: ['SES', 'HGSP', 'HLP', 'LLCE'],
    poids: 1
  },
  {
    id: 'trans_3',
    text: 'Travailler de manière autonome et approfondie',
    specialites: ['Maths', 'Physique', 'NSI', 'HLP'],
    poids: 1
  },
  {
    id: 'trans_4',
    text: 'Manipuler et expérimenter concrètement',
    specialites: ['Physique', 'SVT'],
    poids: 1
  },
  {
    id: 'trans_5',
    text: 'Débattre et argumenter mes idées',
    specialites: ['SES', 'HGSP', 'HLP'],
    poids: 1
  }
];

// Total: 42 questions
