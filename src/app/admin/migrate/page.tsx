'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/ClientApp';
import { useUserProfile } from '@/hooks/useUserProfile';
import { migrateQuestions, migrateSpecialites } from '@/scripts/migrateToFirestore';
import Link from 'next/link';
import { IconBan, IconCheck, IconHourglass, IconInfoTriangle, IconListCheck, IconQuestionMark, IconX } from '@tabler/icons-react';

export default function MigrationPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const { profile: userProfile, loading: loadingProfile } = useUserProfile(user);
  
  const [questionsMigrating, setQuestionsMigrating] = useState(false);
  const [questionsResult, setQuestionsResult] = useState<any>(null);
  
  const [specialitesMigrating, setSpecialitesMigrating] = useState(false);
  const [specialitesResult, setSpecialitesResult] = useState<any>(null);

  const handleMigrateQuestions = async () => {
    if (!confirm('Êtes-vous sûr de vouloir migrer les questions vers Firestore ? Cette action va créer 42 nouvelles questions.')) {
      return;
    }

    try {
      setQuestionsMigrating(true);
      setQuestionsResult(null);
      const result = await migrateQuestions();
      setQuestionsResult(result);
    } catch (error) {
      console.error('Erreur migration questions:', error);
      setQuestionsResult({ success: 0, errors: [String(error)] });
    } finally {
      setQuestionsMigrating(false);
    }
  };

  const handleMigrateSpecialites = async () => {
    if (!confirm('Êtes-vous sûr de vouloir migrer les spécialités vers Firestore ? Cette action va créer 8 nouvelles spécialités.')) {
      return;
    }

    try {
      setSpecialitesMigrating(true);
      setSpecialitesResult(null);
      const result = await migrateSpecialites();
      setSpecialitesResult(result);
    } catch (error) {
      console.error('Erreur migration spécialités:', error);
      setSpecialitesResult({ success: 0, errors: [String(error)] });
    } finally {
      setSpecialitesMigrating(false);
    }
  };

  if (loadingAuth || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4"><IconHourglass size={32} stroke={1.5} /></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (userProfile?.role !== 'prof') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4"><IconBan size={48} stroke={1.5} /></div>
          <h1 className="text-2xl font-bold text-gray-800">Accès refusé</h1>
          <p className="text-gray-600 mt-2">Cette page est réservée aux professeurs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Migration des données vers Firestore</h1>
          <p className="text-gray-600">
            Cette page permet de migrer les questions et spécialités existantes vers Firestore.
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <IconInfoTriangle size={16} stroke={1.5} /> <strong>Attention:</strong> Cette opération ne doit être effectuée qu'une seule fois.
              Si vous avez déjà des données dans Firestore, cette migration créera des doublons.
            </p>
          </div>
        </div>

        {/* Migration des Spécialités */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">📚 Spécialités</h2>
              <p className="text-gray-600">Migrer 8 spécialités vers Firestore</p>
            </div>
            <button
              onClick={handleMigrateSpecialites}
              disabled={specialitesMigrating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {specialitesMigrating ? <><IconHourglass size={16} stroke={1.5} /> Migration...</> : ' Migrer les spécialités'}
            </button>
          </div>

          {specialitesResult && (
            <div className={`p-4 rounded-lg ${specialitesResult.errors.length > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{specialitesResult.errors.length > 0 ? <IconX size={24} stroke={1.5} color='red' /> : <IconCheck size={24} stroke={1.5} color='green' />}</span>
                <h3 className="font-bold text-lg">
                  {specialitesResult.success} spécialité{specialitesResult.success > 1 ? 's' : ''} migrée{specialitesResult.success > 1 ? 's' : ''}
                </h3>
              </div>
              
              {specialitesResult.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-red-800 mb-2">Erreurs:</h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {specialitesResult.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {specialitesResult.success > 0 && (
                <Link
                  href="/admin/specialites"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  → Voir les spécialités
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Migration des Questions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2"><IconQuestionMark size={24} stroke={1.5} /> Questions</h2>
              <p className="text-gray-600">Migrer 42 questions vers Firestore</p>
            </div>
            <button
              onClick={handleMigrateQuestions}
              disabled={questionsMigrating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {questionsMigrating ? <><IconHourglass size={16} stroke={1.5} /> Migration...</> : ' Migrer les questions'}
            </button>
          </div>

          {questionsResult && (
            <div className={`p-4 rounded-lg ${questionsResult.errors.length > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{questionsResult.errors.length > 0 ? <IconX size={24} stroke={1.5} color='red' /> : <IconCheck size={24} stroke={1.5} color='green' />}</span>
                <h3 className="font-bold text-lg">
                  {questionsResult.success} question{questionsResult.success > 1 ? 's' : ''} migrée{questionsResult.success > 1 ? 's' : ''}
                </h3>
              </div>
              
              {questionsResult.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-red-800 mb-2">Erreurs:</h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {questionsResult.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {questionsResult.success > 0 && (
                <Link
                  href="/admin/questions"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  → Voir les questions
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-lg text-blue-900 mb-3 flex items-center gap-2"><IconListCheck size={24} stroke={1.5} /> Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Migrez d'abord les <strong>spécialités</strong> (requis pour les questions)</li>
            <li>Attendez la confirmation de succès</li>
            <li>Ensuite migrez les <strong>questions</strong></li>
            <li>Vérifiez les données dans les pages de gestion</li>
            <li>Une fois la migration terminée, cette page peut être supprimée</li>
          </ol>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            ← Retour au dashboard
          </Link>
          <Link
            href="/admin/specialites"
            className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-all"
          >
            Gérer les spécialités
          </Link>
          <Link
            href="/admin/questions"
            className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-all"
          >
            Gérer les questions
          </Link>
        </div>
      </div>
    </div>
  );
}
