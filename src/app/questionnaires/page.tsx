'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/ClientApp';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getActiveClasses, Classe } from '@/services/classeService';
import ClasseSelectionModal from '@/components/ClasseSelectionModal';
import { IconHourglass, IconListNumbers } from '@tabler/icons-react';

export default function Questionnaires() {
    const router = useRouter();
    const [user, loading] = useAuthState(auth);
    const { profile, loading: loadingProfile, refresh } = useUserProfile(user);
    const [showClasseModal, setShowClasseModal] = useState(false);
    const [classes, setClasses] = useState<Classe[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (profile && profile.role === 'eleve' && !profile.classe) {
            // Si l'élève n'a pas de classe, charger les classes et afficher le modal
            loadClasses();
            setShowClasseModal(true);
        }
    }, [user, loading, profile, router]);

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

    if (loading || loadingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4"><IconHourglass size={48} stroke={1.5} /></div>
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Modal obligatoire pour sélectionner la classe */}
            <ClasseSelectionModal
                isOpen={showClasseModal}
                onClose={() => {}}  // Ne permet pas de fermer le modal sans sélectionner
                userId={user?.uid || ''}
                classes={classes}
                onClasseSelected={handleClasseSelected}
            />

            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4"><IconListNumbers size={48} stroke={1.5} /></div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Questionnaires d'Orientation</h1>
                    <p className="text-gray-600">
                        Répondez aux questionnaires pour découvrir les métiers qui vous correspondent
                    </p>
                </div>

                {profile?.classe && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-800">
                            <span className="font-semibold">Votre classe:</span> {profile.classe}
                        </p>
                    </div>
                )}

                {/* Contenu du questionnaire uniquement si l'utilisateur a une classe (ou n'est pas élève) */}
                {(profile?.role !== 'eleve' || profile?.classe) && (
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            C'est ici qu'on va trouver le questionnaire ainsi que les réponses.
                        </p>
                        <p className="text-sm text-gray-500">
                            Cette page sera développée prochainement avec les questionnaires interactifs.
                        </p>
                    </div>
                )}

                {/* Message d'attente si le modal est affiché */}
                {profile?.role === 'eleve' && !profile?.classe && showClasseModal && (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4"><IconHourglass size={48} stroke={1.5} /></div>
                        <p className="text-gray-600">Veuillez sélectionner votre classe pour continuer...</p>
                    </div>
                )}
            </div>
        </div>
    );
}