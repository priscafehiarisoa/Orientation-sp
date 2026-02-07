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
  },

  
  // Ajouts pour les spécialités générales (voie générale)
  {
    id: "math_6",
    text: "Modéliser des situations réelles avec des fonctions",
    specialites: ["Maths"],
    poids: 3
  },
  {
    id: "math_7",
    text: "Travailler sur les probabilités et les statistiques avancées",
    specialites: ["Maths", "SES"],
    poids: 2
  },
  {
    id: "math_8",
    text: "Étudier les suites et les limites",
    specialites: ["Maths"],
    poids: 3
  },
  {
    id: "phys_6",
    text: "Étudier les ondes et les signaux (lumière, son)",
    specialites: ["Physique"],
    poids: 2
  },
  {
    id: "phys_7",
    text: "Comprendre les réactions chimiques et la cinétique",
    specialites: ["Physique"],
    poids: 3
  },
  {
    id: "phys_8",
    text: "Analyser des systèmes quantiques simples ou relativistes",
    specialites: ["Physique"],
    poids: 2
  },
  {
    id: "svt_6",
    text: "Étudier les mécanismes immunitaires et les vaccins",
    specialites: ["SVT"],
    poids: 3
  },
  {
    id: "svt_7",
    text: "Analyser les enjeux de la transition écologique",
    specialites: ["SVT", "HGSP"],
    poids: 2
  },
  {
    id: "svt_8",
    text: "Travailler sur la physiologie végétale ou animale",
    specialites: ["SVT"],
    poids: 2
  },
  {
    id: "ses_6",
    text: "Analyser le rôle des institutions européennes",
    specialites: ["SES", "HGSP"],
    poids: 2
  },
  {
    id: "ses_7",
    text: "Étudier les mouvements sociaux et les conflits",
    specialites: ["SES"],
    poids: 2
  },
  {
    id: "ses_8",
    text: "Comprendre les mécanismes de la croissance économique",
    specialites: ["SES"],
    poids: 3
  },
  {
    id: "nsi_6",
    text: "Manipuler et analyser de grandes bases de données",
    specialites: ["NSI", "Maths"],
    poids: 2
  },
  {
    id: "nsi_7",
    text: "Développer des interfaces utilisateur interactives",
    specialites: ["NSI"],
    poids: 2
  },
  {
    id: "nsi_8",
    text: "Comprendre le fonctionnement de l'IA et du machine learning",
    specialites: ["NSI"],
    poids: 3
  },
  {
    id: "hgsp_5",
    text: "Étudier les conflits armés et leurs causes",
    specialites: ["HGSP"],
    poids: 3
  },
  {
    id: "hgsp_6",
    text: "Analyser les migrations et les frontières",
    specialites: ["HGSP", "SES"],
    poids: 2
  },
  {
    id: "hgsp_7",
    text: "Comprendre les organisations internationales (ONU, OMC)",
    specialites: ["HGSP"],
    poids: 2
  },
  {
    id: "hlp_5",
    text: "Étudier des auteurs contemporains et leurs idées",
    specialites: ["HLP", "LLCE"],
    poids: 2
  },
  {
    id: "hlp_6",
    text: "Réfléchir sur la justice, la liberté, le bonheur",
    specialites: ["HLP"],
    poids: 3
  },
  {
    id: "hlp_7",
    text: "Analyser des œuvres philosophiques classiques",
    specialites: ["HLP"],
    poids: 3
  },
  {
    id: "llce_5",
    text: "Participer à des débats en langue étrangère",
    specialites: ["LLCE"],
    poids: 2
  },
  {
    id: "llce_6",
    text: "Étudier la civilisation et l'histoire d'un pays anglophone/hispanophone",
    specialites: ["LLCE", "HGSP"],
    poids: 2
  },
  {
    id: "llce_7",
    text: "Écrire des essais ou commentaires en langue étrangère",
    specialites: ["LLCE"],
    poids: 3
  },

  // Nouvelles questions pour la voie STMG
  {
    id: "droit_eco_1",
    text: "Comprendre les règles juridiques qui régissent les contrats et les relations entre personnes",
    specialites: ["Droit et Économie"],
    poids: 3
  },
  {
    id: "droit_eco_2",
    text: "Analyser les droits et obligations des consommateurs dans la société",
    specialites: ["Droit et Économie"],
    poids: 3
  },
  {
    id: "droit_eco_3",
    text: "Étudier le rôle du droit dans la protection de l'environnement et de la transition écologique",
    specialites: ["Droit et Économie"],
    poids: 2
  },
  {
    id: "droit_eco_4",
    text: "Débattre des enjeux économiques liés à la protection des données personnelles (RGPD)",
    specialites: ["Droit et Économie", "SES"],
    poids: 2
  },
  {
    id: "droit_eco_5",
    text: "Comprendre les mécanismes de la responsabilité civile et pénale",
    specialites: ["Droit et Économie"],
    poids: 3
  },
  {
    id: "droit_eco_6",
    text: "Analyser l'impact du droit du travail sur les relations employeur-salarié",
    specialites: ["Droit et Économie"],
    poids: 2
  },
  {
    id: "msg_1",
    text: "Analyser le fonctionnement et la stratégie d'une organisation (entreprise ou association)",
    specialites: ["MSGN"],
    poids: 3
  },
  {
    id: "msg_2",
    text: "Étudier les processus de décision et de pilotage dans une entreprise",
    specialites: ["MSGN"],
    poids: 3
  },
  {
    id: "msg_3",
    text: "Utiliser le numérique pour améliorer la performance et la gestion d'une organisation",
    specialites: ["MSGN", "NSI"],
    poids: 2
  },
  {
    id: "msg_4",
    text: "Comprendre les systèmes d'information et leur rôle dans la prise de décision",
    specialites: ["MSGN", "NSI"],
    poids: 3
  },
  {
    id: "msg_5",
    text: "Analyser la performance économique et financière d'une entité",
    specialites: ["MSGN"],
    poids: 2
  },
  {
    id: "msg_6",
    text: "Gérer des projets en utilisant des outils numériques et collaboratifs",
    specialites: ["MSGN"],
    poids: 2
  },
  {
    id: "msg_7",
    text: "Étudier l'impact de la digitalisation sur les organisations et leurs processus",
    specialites: ["MSGN"],
    poids: 2
  },

  // Transversales supplémentaires
  {
    id: "trans_6",
    text: "Créer et gérer des projets artistiques ou créatifs",
    specialites: ["HLP", "LLCE"],
    poids: 1
  },
  {
    id: "trans_7",
    text: "Pratiquer une activité sportive intense et analyser ses performances",
    specialites: ["Physique", "SVT"],
    poids: 1
  },
  {
    id: "trans_8",
    text: "Utiliser le numérique pour communiquer ou créer du contenu",
    specialites: ["NSI", "SES", "LLCE"],
    poids: 1
  },
  {
    id: "trans_9",
    text: "S'intéresser à l'environnement et au développement durable",
    specialites: ["SVT", "HGSP"],
    poids: 1
  },
  {
    id: "trans_10",
    text: "Préférer des activités intellectuelles abstraites et théoriques",
    specialites: ["Maths", "HLP", "Physique"],
    poids: 1
  }


  
];

// Total: 42 questions
