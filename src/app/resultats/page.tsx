'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ReponseUtilisateur, ScoreSpecialite, specialitesInfo } from '@/types/questionnaire';
import { calculerScores, getTopSpecialites, genererExplication } from '@/utils/calculScores';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/ClientApp';
import { sauvegarderResultat } from '@/services/resultatService';
import { useUserProfile } from '@/hooks/useUserProfile';
import ContactConseillerModal from '@/components/ContactConseillerModal';
import { genererPDFResultats } from '@/utils/pdfGenerator';
import { IconBriefcase, IconChartLine, IconCheck, IconDashboard, IconFile, IconInfoCircle, IconMessageCircle, IconRefresh, IconTarget, IconX } from '@tabler/icons-react';

export default function ResultatsPage() {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const { profile } = useUserProfile(user);
  const [scores, setScores] = useState<ScoreSpecialite[]>([]);
  const [topSpecialites, setTopSpecialites] = useState<ScoreSpecialite[]>([]);
  const [explication, setExplication] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [startTime] = useState<number>(Date.now());
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    // Récupérer les réponses du localStorage
    const reponsesStr = localStorage.getItem('reponses_questionnaire');
    if (!reponsesStr) {
      router.push('/questionnaire');
      return;
    }

    const reponsesData: ReponseUtilisateur[] = JSON.parse(reponsesStr);
    
    // Calculer les scores
    const scoresCalcules = calculerScores(reponsesData);
    setScores(scoresCalcules);

    // Obtenir le top 4
    const top = getTopSpecialites(scoresCalcules, 4);
    setTopSpecialites(top);

    // Générer l'explication
    const expl = genererExplication(top);
    setExplication(expl);

    // Sauvegarder automatiquement si connecté
    if (user && profile) {
      const duree = Math.floor((Date.now() - startTime) / 1000);
      sauvegarderResultats(reponsesData, scoresCalcules, top, duree);
    } else {
      console.log('Utilisateur non connecté, pas de sauvegarde');
    }
  }, [user, profile]);

  const sauvegarderResultats = async (
    reponses: ReponseUtilisateur[], 
    scores: ScoreSpecialite[], 
    top: ScoreSpecialite[],
    duree: number
  ) => {
    if (!user || !profile) return;

    try {
      console.log('Début de la sauvegarde dans Firestore...');
      
      await sauvegarderResultat(
        user.uid,
        user.email || 'email_inconnu',
        profile.displayName || user.displayName || 'Utilisateur',
        profile.classe || null,
        reponses,
        scores,
        top,
        duree
      );
      
      console.log('Sauvegarde réussie dans Firestore!');
      setIsSaved(true);
      setSaveError(null);
    } catch (error: any) {
      console.error(' Erreur lors de la sauvegarde:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setSaveError(error.message);
    }
  };

  const recommencerQuestionnaire = () => {
    localStorage.removeItem('reponses_questionnaire');
    router.push('/questionnaire');
  };

  if (scores.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4"><IconTarget size={48} stroke={1.5} /></div>
          <p className="text-xl text-blue-600">Calcul de tes résultats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            Tes résultats sont prêts !
          </h1>
          {isSaved && (
            <p className="text-green-700 font-medium flex items-center gap-2 justify-center">
              <IconCheck size={24} color='green'/> Tes résultats ont été sauvegardés dans ton compte
            </p>
          )}
          {saveError && (
            <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-medium">
                <IconX size={24} className="inline-block mr-2" color='red'/> Erreur de sauvegarde: {saveError}
              </p>
              <p className="text-sm text-red-500 mt-1">
                Vérifie ta connexion et réessaie
              </p>
            </div>
          )}
          {!user && (
            <p className="text-orange-700 font-medium flex items-center gap-2 justify-center">
              <IconInfoCircle size={24} color='orange'/>  Connecte-toi pour sauvegarder tes résultats
            </p>
          )}
        </div>

        {/* Explication */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Ton profil</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {explication}
          </p>
        </div>

        {/* Top spécialités */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-blue-600 mb-6">🏆 Tes spécialités recommandées</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {topSpecialites.map((score, index) => {
              const info = specialitesInfo[score.specialite];
              return (
                <div
                  key={score.specialite}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all"
                >
                  <div 
                    className="p-6"
                    style={{ backgroundColor: info.couleur + '20' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-5xl">{info.emoji}</span>
                        <div>
                          <h3 className="text-2xl font-bold" style={{ color: info.couleur }}>
                            {index === 0 && '🥇 '}
                            {index === 1 && '🥈 '}
                            {index === 2 && '🥉 '}
                            {score.specialite}
                          </h3>
                          <p className="text-gray-600">{info.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Barre de compatibilité */}
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-700">Compatibilité</span>
                        <span className="font-bold text-xl" style={{ color: info.couleur }}>
                          {score.pourcentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${score.pourcentage}%`,
                            backgroundColor: info.couleur
                          }}
                        />
                      </div>
                    </div>

                    {/* Métiers */}
                    <div className="mb-3">
                      <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><IconBriefcase size={24} /> Exemples de métiers :</h4>
                      <div className="flex flex-wrap gap-2">
                        {info.metiers.slice(0, 3).map((metier, i) => (
                          <span key={i} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">
                            {metier}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tous les scores */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><IconChartLine size={24} /> Tous tes scores</h2>
          <div className="space-y-4">
            {scores
              .sort((a, b) => b.pourcentage - a.pourcentage)
              .map((score, index) => {
              const info = specialitesInfo[score.specialite];
              return (
                <div key={score.specialite} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 min-w-[2.5rem]">
                    <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                  </div>
                  <span className="text-3xl">{info.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-gray-800">{score.specialite}</span>
                      <span className="font-bold" style={{ color: info.couleur }}>
                        {score.pourcentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${score.pourcentage}%`,
                          backgroundColor: info.couleur
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* <button
            onClick={recommencerQuestionnaire}
            className="px-8 py-4 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            <IconRefresh size={24} className="inline-block mr-2" /> Recommencer le questionnaire
          </button> */}
          
          {user && profile && (
            <>
              <button
                onClick={() => {
                  genererPDFResultats(
                    profile.displayName || user.displayName || 'Utilisateur',
                    user.email || '',
                    profile.classe || null,
                    topSpecialites,
                    scores,
                    explication
                  );
                }}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 transition-all shadow-lg"
              >
                <IconFile size={24} className="inline-block mr-2" /> Exporter en PDF
              </button>
              
              {/* <button
                onClick={() => setShowContactModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg"
              >
                <IconMessageCircle size={24} className="inline-block mr-2" /> Contacter un Conseiller
              </button> */}
            </>
          )}
          
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-center"
          >
            <IconDashboard size={24} className="inline-block mr-2" /> Voir mon tableau de bord
          </Link>
        </div>
      </div>

      {/* Modal Contacter Conseiller */}
      {user && (
        <ContactConseillerModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          userId={user.uid}
          userEmail={user.email || ''}
          userName={profile?.displayName || user.displayName || 'Utilisateur'}
          topSpecialites={topSpecialites.map(s => s.specialite)}
        />
      )}
    </div>
  );
}
