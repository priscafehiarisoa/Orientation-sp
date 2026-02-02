'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/ClientApp';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getActiveClasses, Classe } from '@/services/classeService';
import ClasseSelectionModal from '@/components/ClasseSelectionModal';
import { questions } from '@/data/questions';
import { ReponseUtilisateur } from '@/types/questionnaire';
import { IconHourglass, IconSchool } from '@tabler/icons-react';

const LIKERT_SCALE = [
  { value: 1, label: 'Je déteste', emoji: '😖', color: 'bg-red-500' },
  { value: 2, label: 'Je n\'aime pas', emoji: '😕', color: 'bg-orange-400' },
  { value: 3, label: 'Neutre', emoji: '😐', color: 'bg-gray-400' },
  { value: 4, label: 'J\'aime', emoji: '🙂', color: 'bg-green-400' },
  { value: 5, label: 'J\'adore', emoji: '😍', color: 'bg-green-600' }
];

export default function QuestionnairePage() {
  const router = useRouter();
  const [user, loadingAuth] = useAuthState(auth);
  const { profile, loading: loadingProfile, refresh } = useUserProfile(user);
  const [showClasseModal, setShowClasseModal] = useState(false);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [reponses, setReponses] = useState<ReponseUtilisateur[]>([]);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  // Vérifier l'authentification et la classe de l'élève
  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push('/login');
      return;
    }

    if (profile && profile.role === 'eleve' && !profile.classe) {
      // Si l'élève n'a pas de classe, charger les classes et afficher le modal
      loadClasses();
      setShowClasseModal(true);
    }
  }, [user, loadingAuth, profile, router]);

  const loadClasses = async () => {
    try {
      const fetchedClasses = await getActiveClasses();
      setClasses(fetchedClasses);
    } catch (error) {
      console.error('Erreur chargement classes:', error);
    }
  };

  const handleClasseSelected = async () => {
    // Recharger le profil utilisateur pour mettre à jour l'affichage
    await refresh();
    setShowClasseModal(false);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
  };

  const handleNext = () => {
    if (selectedScore === null) return;

    // Sauvegarder la réponse
    const nouvelleReponse: ReponseUtilisateur = {
      questionId: currentQuestion.id,
      score: selectedScore
    };
    const nouvellesReponses = [...reponses, nouvelleReponse];
    setReponses(nouvellesReponses);

    if (isLastQuestion) {
      // Sauvegarder les réponses dans le localStorage et rediriger vers les résultats
      localStorage.setItem('reponses_questionnaire', JSON.stringify(nouvellesReponses));
      router.push('/resultats');
    } else {
      // Passer à la question suivante
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedScore(null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      // Retirer la dernière réponse
      const nouvellesReponses = reponses.slice(0, -1);
      setReponses(nouvellesReponses);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      
      // Récupérer la réponse précédente
      const reponsePrecedente = reponses[reponses.length - 1];
      if (reponsePrecedente) {
        setSelectedScore(reponsePrecedente.score);
      } else {
        setSelectedScore(null);
      }
    }
  };

  // Afficher le chargement pendant l'authentification
  if (loadingAuth || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4"><IconHourglass size={48} stroke={1.5} /></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Ne pas afficher le questionnaire si le modal de classe est affiché
  const canShowQuestionnaire = !showClasseModal && (profile?.role !== 'eleve' || profile?.classe);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      {/* Modal obligatoire pour sélectionner la classe */}
      <ClasseSelectionModal
        isOpen={showClasseModal}
        onClose={() => {}}  // Ne permet pas de fermer le modal sans sélectionner
        userId={user?.uid || ''}
        classes={classes}
        onClasseSelected={handleClasseSelected}
      />

      {!canShowQuestionnaire ? (
        // Message d'attente si le modal est affiché
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4"><IconSchool size={48} stroke={1.5} /></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Un instant...</h2>
            <p className="text-gray-600">
              Veuillez sélectionner votre classe pour commencer le questionnaire
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
        {/* Header avec progression */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-blue-600">Questionnaire d'orientation</h1>
            <span className="text-sm text-gray-600 font-medium">
              Question {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          
          {/* Barre de progression */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {Math.round(progress)}% complété
          </p>
        </div>

        {/* Carte de la question */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Échelle de Likert */}
          <div className="space-y-3">
            {LIKERT_SCALE.map((option) => (
              <button
                key={option.value}
                onClick={() => handleScoreSelect(option.value)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                  selectedScore === option.value
                    ? `${option.color} border-gray-800 text-white scale-105 shadow-lg`
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-md bg-gray-50'
                }`}
              >
                <span className="text-3xl">{option.emoji}</span>
                <div className="flex-1 text-left">
                  <span className={`font-semibold text-lg ${
                    selectedScore === option.value ? 'text-white' : 'text-gray-800'
                  }`}>
                    {option.label}
                  </span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedScore === option.value
                    ? 'border-white bg-white'
                    : 'border-gray-300'
                }`}>
                  {selectedScore === option.value && (
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Boutons de navigation */}
        <div className="flex justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← Précédent
          </button>
          
          <button
            onClick={handleNext}
            disabled={selectedScore === null}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isLastQuestion ? 'Voir mes résultats →' : 'Suivant →'}
          </button>
        </div>

        {/* Indicateur d'aide */}
        <p className="text-center text-sm text-gray-500 mt-6">
          💡 Réponds instinctivement, il n'y a pas de bonne ou mauvaise réponse !
        </p>
      </div>
      )}
    </div>
  );
}
