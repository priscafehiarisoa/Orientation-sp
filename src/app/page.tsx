'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/ClientApp";
import { useEffect, useState } from "react";
import { getActiveSpecialites, SpecialiteInfo } from "@/services/specialiteService";
import { IconClock, IconDashboard, IconLock, IconPlayerPlay, IconBriefcase, IconTarget } from "@tabler/icons-react";

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [specialites, setSpecialites] = useState<SpecialiteInfo[]>([]);
  const [loadingSpecialites, setLoadingSpecialites] = useState(true);

  useEffect(() => {
    chargerSpecialites();
  }, []);

  const chargerSpecialites = async () => {
    try {
      const specs = await getActiveSpecialites();
      setSpecialites(specs);
    } catch (error) {
      console.error('Erreur chargement spécialités:', error);
    } finally {
      setLoadingSpecialites(false);
    }
  };

  const handleQuestionnaireClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      router.push('/questionnaire');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo et titre */}
          <div className="mb-8">
            <div className="text-7xl mb-4">🧠</div>
            <h1 className="text-5xl md:text-6xl font-bold text-blue-600 mb-4">
              Chemins de Spé
            </h1>
            <p className="text-2xl text-indigo-600 font-medium">
              Trouve ta spécialité idéale au lycée !
            </p>
          </div>

          {/* Description */}
          <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
            Un questionnaire interactif de 10 minutes pour découvrir les spécialités 
            qui correspondent le mieux à tes intérêts et ambitions. Obtiens des recommandations 
            personnalisées et explore les métiers possibles !
          </p>

          {/* Icônes des spécialités */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {loadingSpecialites ? (
              <div className="text-gray-500">Chargement des spécialités...</div>
            ) : (
              specialites.map((spec) => (
                <div 
                  key={spec.id}
                  className="rounded-full px-4 py-2 flex items-center gap-2"
                  style={{ backgroundColor: spec.couleur + '20' }}
                >
                  <span className="text-2xl">{spec.emoji}</span>
                  <span className="font-medium text-gray-700">{spec.nom}</span>
                </div>
              ))
            )}
          </div>

          {/* Boutons CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              onClick={handleQuestionnaireClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all shadow-lg"
            >
              <IconPlayerPlay size={24} stroke={1.5} /> Commencer le questionnaire
            </button>
            
            {user && (
              <Link 
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white text-lg font-semibold rounded-lg hover:from-green-600 hover:to-teal-600 transition-all shadow-lg"
              >
                <IconDashboard size={24} stroke={1.5} /> Mon Dashboard
              </Link>
            )}
          </div>

          {/* Statistiques / Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex justify-center text-4xl mb-3"><IconClock size={40} stroke={1.5} /></div>
              <h3 className="font-bold text-xl text-blue-600 mb-2">5-10 minutes</h3>
              <p className="text-gray-600">Un questionnaire rapide et simple</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex justify-center text-4xl mb-3"><IconTarget size={40} stroke={1.5} /></div>
              <h3 className="font-bold text-xl text-blue-600 mb-2">
                {loadingSpecialites ? '...' : specialites.length} spécialités
              </h3>
              <p className="text-gray-600">Toutes les spécialités du lycée général</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex justify-center text-4xl mb-3"><IconBriefcase size={40} stroke={1.5} /></div>
              <h3 className="font-bold text-xl text-blue-600 mb-2">Métiers & Études</h3>
              <p className="text-gray-600">Découvre les perspectives d'avenir</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'authentification */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAuthModal(false)}>
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-5xl mb-4"><IconLock size={48} stroke={1.5} /></div>
              <h2 className="text-2xl font-bold text-blue-600 mb-2">Connexion requise</h2>
              <p className="text-gray-600">
                Pour sauvegarder vos résultats et accéder au questionnaire complet, 
                veuillez vous connecter ou créer un compte.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Link 
                href="/login"
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all text-center"
              >
                Se connecter
              </Link>
              <Link 
                href="/register/eleve"
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all text-center"
              >
                Créer un compte
              </Link>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {/* <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <div className="flex justify-center gap-8 mb-4">
             <Link href="/about" className="hover:text-blue-600 transition-colors">
              À propos
            </Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors">
              Contact
            </Link> 
          </div>
           <p className="text-sm">© 2026 - DAMA Prisca Fehiarisoa</p> 
        </div>
      </footer> */}
    </div>
  );
}

