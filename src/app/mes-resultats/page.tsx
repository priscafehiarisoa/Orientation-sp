'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/firebase/ClientApp';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ScoreSpecialite, specialitesInfo } from '@/types/questionnaire';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconListNumbers, IconX, IconChecklist } from '@tabler/icons-react';

interface ResultatSauvegarde {
  id: string;
  userId: string;
  date: any;
  scores: ScoreSpecialite[];
  topSpecialites: ScoreSpecialite[];
}

export default function MesResultatsPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [resultats, setResultats] = useState<ResultatSauvegarde[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      chargerResultats();
    }
  }, [user, loading]);

  const chargerResultats = async () => {
    if (!user) return;

    try {
      console.log('Chargement des résultats pour:', user.uid);
      const resultatsRef = collection(db, 'resultats_questionnaires');
      const q = query(
        resultatsRef, 
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      console.log('Nombre de résultats trouvés:', querySnapshot.size);
      
      const resultatsData: ResultatSauvegarde[] = [];
      querySnapshot.forEach((doc) => {
        resultatsData.push({
          id: doc.id,
          ...doc.data()
        } as ResultatSauvegarde);
      });
      
      setResultats(resultatsData);
      setError(null);
    } catch (err: any) {
      console.error('Erreur lors du chargement des résultats:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center animate-spin text-6xl mb-4"><IconListNumbers size={48} stroke={1.5} /></div>
          <p className="text-xl text-blue-600">Chargement de tes résultats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center text-6xl mb-4"><IconListNumbers size={48} stroke={1.5} /></div>
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            Mes Résultats Sauvegardés
          </h1>
          <p className="text-gray-600">
            Consulte l'historique de tous tes questionnaires
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium flex items-center gap-2">
              <IconX size={24} stroke={1.5} /> Erreur: {error}
            </p>
          </div>
        )}

        {resultats.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="flex justify-center text-6xl mb-4"><IconChecklist size={48} stroke={1.5} /></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Aucun résultat sauvegardé
            </h2>
            <p className="text-gray-600 mb-6">
              Tu n'as pas encore passé de questionnaire
            </p>
            <Link 
              href="/questionnaire"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
            >
               Passer le questionnaire
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {resultats.map((resultat, index) => {
              const dateObj = resultat.date?.toDate ? resultat.date.toDate() : new Date(resultat.date);
              const dateFormatted = dateObj.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={resultat.id} className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Questionnaire #{resultats.length - index}
                      </h3>
                      <p className="text-sm text-gray-500">{dateFormatted}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    {resultat.topSpecialites.slice(0, 4).map((score, idx) => {
                      const info = specialitesInfo[score.specialite];
                      return (
                        <div
                          key={score.specialite}
                          className="p-4 rounded-xl"
                          style={{ backgroundColor: info.couleur + '20' }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{info.emoji}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-sm" style={{ color: info.couleur }}>
                                {idx === 0 && '🥇 '}
                                {idx === 1 && '🥈 '}
                                {idx === 2 && '🥉 '}
                                {score.specialite}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Score</span>
                              <span className="font-bold">{score.pourcentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
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
              );
            })}
          </div>
        )}

        {/* Bouton pour refaire le questionnaire */}
        {/* <div className="mt-8 text-center">
          <Link 
            href="/questionnaire"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all shadow-lg"
          >
            <IconRefresh size={24} stroke={1.5} /> Refaire le questionnaire
          </Link>
        </div> */}
      </div>
    </div>
  );
}
