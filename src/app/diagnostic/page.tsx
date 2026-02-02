'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/firebase/ClientApp';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function DiagnosticPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fixStatus, setFixStatus] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (!loadingAuth) {
      runDiagnostic();
    }
  }, [loadingAuth, user]);

  const runDiagnostic = async () => {
    setLoading(true);
    const info: any = {
      timestamp: new Date().toISOString(),
      firebaseAuth: null,
      firestoreProfile: null,
      problems: [],
      solutions: []
    };

    // 1. Vérifier Firebase Auth
    if (!user) {
      info.firebaseAuth = { status: '❌ Non connecté' };
      info.problems.push('Aucun utilisateur connecté');
      info.solutions.push('Connectez-vous d\'abord via /login');
    } else {
      info.firebaseAuth = {
        status: '✅ Connecté',
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        creationTime: user.metadata.creationTime
      };

      // 2. Vérifier profil Firestore
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          info.firestoreProfile = {
            status: '✅ Existe',
            data: userSnap.data()
          };
        } else {
          info.firestoreProfile = { status: '❌ Manquant' };
          info.problems.push('Profil Firestore manquant');
          info.solutions.push('Cliquez sur le bouton "Créer le profil" ci-dessous');
        }
      } catch (error: any) {
        info.firestoreProfile = {
          status: '❌ Erreur',
          error: error.message
        };
        info.problems.push('Erreur accès Firestore: ' + error.message);
      }
    }

    setDiagnosticInfo(info);
    setLoading(false);
  };

  const createMissingProfile = async () => {
    if (!user) {
      setFixStatus('❌ Veuillez vous connecter d\'abord');
      return;
    }

    setFixStatus('🔄 Création du profil en cours...');

    try {
      const userRef = doc(db, 'users', user.uid);
      const newProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
        role: 'eleve', // Changez en 'prof' si nécessaire
        classe: null,
        age: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(userRef, newProfile);
      setFixStatus('✅ Profil créé avec succès ! Redirection...');
      
      // Rerun diagnostic
      await runDiagnostic();
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      setFixStatus('❌ Erreur: ' + error.message);
    }
  };

  if (loadingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl text-gray-600">Diagnostic en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🔍 Diagnostic Système</h1>
          <p className="text-gray-600 mb-6">Vérification de votre configuration</p>

          {diagnosticInfo && (
            <div className="space-y-6">
              {/* Firebase Auth */}
              <div className="border rounded-lg p-4">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span>🔐</span>
                  Firebase Authentication
                </h2>
                <div className="bg-gray-50 rounded p-4 font-mono text-sm">
                  <pre>{JSON.stringify(diagnosticInfo.firebaseAuth, null, 2)}</pre>
                </div>
              </div>

              {/* Firestore Profile */}
              <div className="border rounded-lg p-4">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span>💾</span>
                  Profil Firestore
                </h2>
                <div className="bg-gray-50 rounded p-4 font-mono text-sm">
                  <pre>{JSON.stringify(diagnosticInfo.firestoreProfile, null, 2)}</pre>
                </div>
              </div>

              {/* Problèmes détectés */}
              {diagnosticInfo.problems.length > 0 && (
                <div className="border-2 border-red-300 rounded-lg p-4 bg-red-50">
                  <h2 className="text-lg font-bold mb-3 text-red-800 flex items-center gap-2">
                    <span>⚠️</span>
                    Problèmes détectés ({diagnosticInfo.problems.length})
                  </h2>
                  <ul className="list-disc list-inside space-y-1 text-red-700">
                    {diagnosticInfo.problems.map((problem: string, idx: number) => (
                      <li key={idx}>{problem}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Solutions */}
              {diagnosticInfo.solutions.length > 0 && (
                <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                  <h2 className="text-lg font-bold mb-3 text-green-800 flex items-center gap-2">
                    <span>💡</span>
                    Solutions proposées
                  </h2>
                  <ul className="list-disc list-inside space-y-1 text-green-700 mb-4">
                    {diagnosticInfo.solutions.map((solution: string, idx: number) => (
                      <li key={idx}>{solution}</li>
                    ))}
                  </ul>

                  {user && !diagnosticInfo.firestoreProfile?.data && (
                    <button
                      onClick={createMissingProfile}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                    >
                      🔧 Créer le profil Firestore
                    </button>
                  )}
                </div>
              )}

              {/* Status fix */}
              {fixStatus && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <p className="text-blue-800 font-medium">{fixStatus}</p>
                </div>
              )}

              {/* Tout est OK */}
              {diagnosticInfo.problems.length === 0 && (
                <div className="border-2 border-green-300 rounded-lg p-6 bg-green-50 text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    Tout fonctionne correctement !
                  </h2>
                  <p className="text-green-700 mb-4">
                    Votre configuration est complète et fonctionnelle.
                  </p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                  >
                    Aller au Dashboard →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 pt-6 border-t flex gap-4">
            <button
              onClick={runDiagnostic}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              🔄 Re-diagnostiquer
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              ← Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
