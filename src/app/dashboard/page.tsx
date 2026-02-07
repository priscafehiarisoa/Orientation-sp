'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/ClientApp';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getResultatsUtilisateur, ResultatQuestionnaire } from '@/services/resultatService';
import { SpecialiteInfo as FirestoreSpecialiteInfo, getActiveSpecialites } from '@/services/specialiteService';
import Link from 'next/link';
import { IconUser, IconSchool, IconChartBar, IconChecklist, IconStar, IconMicroscope, IconBooks, IconWorld, IconListNumbers, IconPlayerPlay, IconHistory, IconUsers, IconBolt, IconQuestionMark } from '@tabler/icons-react';

export default function DashboardPage() {
    const router = useRouter();
    const [user, loadingAuth] = useAuthState(auth);
    const { profile, loading: loadingProfile } = useUserProfile(user);
    const [resultats, setResultats] = useState<ResultatQuestionnaire[]>([]);
    const [loadingResultats, setLoadingResultats] = useState(true);
    const [specialitesMap, setSpecialitesMap] = useState<Record<string, FirestoreSpecialiteInfo>>({});

    // Redirection si non connecté
    useEffect(() => {
        if (!loadingAuth && !loadingProfile && (!user || !profile)) {
            router.push('/login');
        }
    }, [user, profile, loadingAuth, loadingProfile, router]);

    useEffect(() => {
        if (user && !loadingAuth && !loadingProfile) {
            chargerResultats();
        }
    }, [user, loadingAuth, loadingProfile]);

    useEffect(() => {
        const loadSpecialites = async () => {
            try {
                const specs = await getActiveSpecialites();
                const map = specs.reduce((acc, spec) => {
                    acc[spec.nom] = spec;
                    return acc;
                }, {} as Record<string, FirestoreSpecialiteInfo>);
                setSpecialitesMap(map);
            } catch (error) {
                console.error('Erreur chargement spécialités:', error);
            }
        };

        loadSpecialites();
    }, []);

    const chargerResultats = async () => {
        if (!user) return;
        
        try {
            const data = await getResultatsUtilisateur(user.uid);
            setResultats(data);
        } catch (error) {
            console.error('Erreur chargement résultats:', error);
        } finally {
            setLoadingResultats(false);
        }
    };

    if (loadingAuth || loadingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!user || !profile) {
        return null;
    }

    // Calcul des statistiques pour les graphiques
    const dernierResultat = resultats[0];
    const distributionInterets = dernierResultat ? calculerDistributionInterets(dernierResultat) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-blue-600 mb-2">
                        Bienvenue {profile.displayName} 
                    </h1>
                    <p className="text-gray-600">
                        {profile.role === 'prof' ? 'Espace Professeur' : 'Espace Élève'}
                        {profile.classe && ` • Classe de ${profile.classe}`}
                    </p>
                </div>

                {profile.role === 'eleve' ? (
                    <DashboardEleve 
                        profile={profile}
                        resultats={resultats}
                        loadingResultats={loadingResultats}
                        distributionInterets={distributionInterets}
                        specialitesMap={specialitesMap}
                    />
                ) : (
                    <DashboardProf profile={profile} />
                )}
            </div>
        </div>
    );
}

// Composant Dashboard Élève
function DashboardEleve({ 
    profile, 
    resultats, 
    loadingResultats,
    distributionInterets,
    specialitesMap
}: { 
    profile: any; 
    resultats: ResultatQuestionnaire[];
    loadingResultats: boolean;
    distributionInterets: { sciences: number; humanites: number; autre: number } | null;
    specialitesMap: Record<string, FirestoreSpecialiteInfo>;
}) {
    const getSpecialiteInfo = (name: string) => {
        return (
            specialitesMap[name] || {
                nom: name,
                emoji: '⭐',
                couleur: '#6B7280',
                description: '',
                metiers: [],
                etudes: []
            }
        );
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-4xl"><IconChecklist size={40} stroke={1.5} /></div>
                        <div className="text-right">
                            <p className="text-3xl font-bold">{resultats.length}</p>
                            <p className="text-blue-100 text-sm">Questionnaire{resultats.length > 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-4xl"><IconStar size={40} stroke={1.5} /></div>
                        <div className="text-right">
                            <p className="text-3xl font-bold">
                                {resultats[0]?.topSpecialites[0]?.specialite.slice(0, 8) || '-'}
                            </p>
                            <p className="text-green-100 text-sm">Top Spécialité</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-4xl"><IconStar size={40} stroke={1.5} /></div>
                        <div className="text-right">
                            <p className="text-3xl font-bold">
                                {resultats[0]?.topSpecialites[0]?.pourcentage || 0}%
                            </p>
                            <p className="text-purple-100 text-sm">Compatibilité</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphique Distribution Intérêts */}
            {distributionInterets && (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><IconChartBar size={24} stroke={1.5} /> Distribution de tes intérêts</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">Sciences <IconMicroscope size={16} stroke={1.5} /></span>
                                <span className="text-sm font-bold text-blue-600">{distributionInterets.sciences}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${distributionInterets.sciences}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">Humanités <IconBooks size={16} stroke={1.5} /></span>
                                <span className="text-sm font-bold text-purple-600">{distributionInterets.humanites}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${distributionInterets.humanites}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">Autre <IconWorld size={16} stroke={1.5} /></span>
                                <span className="text-sm font-bold text-orange-600">{distributionInterets.autre}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-orange-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${distributionInterets.autre}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Résultats Récents */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><IconListNumbers size={24} stroke={1.5} /> Tes Résultats Récents</h2>
                    <Link 
                        href="/mes-resultats"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        Voir tout →
                    </Link>
                </div>
                
                {loadingResultats ? (
                    <p className="text-gray-500">Chargement...</p>
                ) : resultats.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">Tu n'as pas encore passé de questionnaire</p>
                        <Link 
                            href="/questionnaire"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
                        >
                            <IconPlayerPlay size={16} stroke={1.5} /> Commencer maintenant
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {resultats.slice(0, 3).map((resultat, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {resultat.date?.toDate?.()?.toLocaleDateString('fr-FR') || 'Date inconnue'}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                        Terminé
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {resultat.topSpecialites.slice(0, 4).map((spec) => {
                                        const info = getSpecialiteInfo(spec.specialite);
                                        return (
                                            <div 
                                                key={spec.specialite}
                                                className="flex items-center gap-2 p-2 rounded-lg"
                                                style={{ backgroundColor: info.couleur + '20' }}
                                            >
                                                <span className="text-xl">{info.emoji}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold truncate">{spec.specialite}</p>
                                                    <p className="text-xs text-gray-600">{spec.pourcentage}%</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions Rapides */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* <Link 
                    href="/questionnaire"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white hover:shadow-xl transition-all"
                >
                    <div className="text-4xl mb-3"><IconPlayerPlay size={40} stroke={1.5} /></div>
                    <h3 className="text-xl font-bold mb-2">Nouveau Questionnaire</h3>
                    <p className="text-blue-100">Découvre tes spécialités idéales</p>
                </Link> */}

                <Link 
                    href="/mes-resultats"
                    className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white hover:shadow-xl transition-all"
                >
                    <div className="text-4xl mb-3"><IconHistory size={40} stroke={1.5} /></div>
                    <h3 className="text-xl font-bold mb-2">Historique Complet</h3>
                    <p className="text-purple-100">Consulte tous tes résultats</p>
                </Link>

                <Link 
                    href="/profile"
                    className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-6 text-white hover:shadow-xl transition-all"
                >
                    <div className="text-4xl mb-3"><IconUser size={40} stroke={1.5} /></div>
                    <h3 className="text-xl font-bold mb-2">Mon Profil</h3>
                    <p className="text-green-100">Gérer mes informations</p>
                </Link>
            </div>
        </div>
    );
}

// Composant Dashboard Prof
function DashboardProf({ profile }: { profile: any }) {
    const [stats, setStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        chargerStatistiques();
    }, []);

    const chargerStatistiques = async () => {
        try {
            const { getStatistiquesGlobales } = await import('@/services/resultatService');
            const data = await getStatistiquesGlobales();
            setStats(data);
        } catch (error) {
            console.error('Erreur chargement statistiques:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Participants</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">
                                {loadingStats ? '...' : stats?.totalParticipants || 0}
                            </p>
                        </div>
                        <div className="text-5xl"><IconUsers size={40} stroke={1.5} /></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Classes Actives</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {loadingStats ? '...' : stats?.participantsParClasse ? Object.keys(stats.participantsParClasse).length : 0}
                            </p>
                        </div>
                        <div className="text-5xl"><IconSchool size={40} stroke={1.5} /></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Spécialités</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">
                                {loadingStats ? '...' : stats?.specialitesPlusChoisies?.length || 0}
                            </p>
                        </div>
                        <div className="text-5xl"><IconBooks size={40} stroke={1.5} /></div>
                    </div>
                </div>
            </div>

            {/* Graphiques */}
            {!loadingStats && stats && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Top 5 Spécialités */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2"><IconChartBar size={24} stroke={1.5} /> Top 5 Spécialités Choisies</h3>
                        <div className="space-y-3">
                            {stats.specialitesPlusChoisies && stats.specialitesPlusChoisies.slice(0, 5).map((spec: any, idx: number) => {
                                const total = stats.totalParticipants || 1;
                                const pourcentage = Math.round((spec.count / total) * 100);
                                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'];
                                
                                return (
                                    <div key={spec.specialite}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-gray-700">{spec.specialite}</span>
                                            <span className="text-sm text-gray-500">{spec.count} élèves ({pourcentage}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div 
                                                className={`${colors[idx % colors.length]} h-2.5 rounded-full transition-all duration-500`}
                                                style={{ width: `${pourcentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Participants par Classe */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2"><IconSchool size={24} stroke={1.5} /> Participants par Classe</h3>
                        <div className="space-y-3">
                            {stats.participantsParClasse && Object.entries(stats.participantsParClasse)
                                .sort((a: any, b: any) => b[1] - a[1])
                                .slice(0, 5)
                                .map(([classe, count]: [string, any], idx: number) => {
                                    const total = stats.totalParticipants || 1;
                                    const pourcentage = Math.round((count / total) * 100);
                                    const colors = ['bg-indigo-500', 'bg-cyan-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500'];
                                    
                                    return (
                                        <div key={classe}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-700">{classe || 'Non renseignée'}</span>
                                                <span className="text-sm text-gray-500">{count} élèves ({pourcentage}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div 
                                                    className={`${colors[idx % colors.length]} h-2.5 rounded-full transition-all duration-500`}
                                                    style={{ width: `${pourcentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="bg-blue-50 rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-800 flex items-center gap-2"><IconBolt size={24} stroke={1.5} /> Actions Rapides</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link 
                        href="/admin"
                        className="bg-white rounded-xl p-6 hover:shadow-lg transition-all border border-blue-200"
                    >
                        <div className="text-4xl mb-3"><IconChecklist size={40} stroke={1.5} /></div>
                        <h3 className="font-bold text-lg mb-2">Liste des Participants</h3>
                        <p className="text-gray-600 text-sm">Voir les résultats de tous les élèves</p>
                    </Link>

                    <Link 
                        href="/admin/questions"
                        className="bg-white rounded-xl p-6 hover:shadow-lg transition-all border border-blue-200"
                    >
                        <div className="text-4xl mb-3"><IconQuestionMark size={40} stroke={1.5} /></div>
                        <h3 className="font-bold text-lg mb-2">Gérer les Questions</h3>
                        <p className="text-gray-600 text-sm">Modifier le questionnaire</p>
                    </Link>

                    <Link 
                        href="/admin/specialites"
                        className="bg-white rounded-xl p-6 hover:shadow-lg transition-all border border-blue-200"
                    >
                        <div className="text-4xl mb-3"><IconBooks size={40} stroke={1.5} /></div>
                        <h3 className="font-bold text-lg mb-2">Gérer les Spécialités</h3>
                        <p className="text-gray-600 text-sm">Ajouter et modifier les spécialités</p>
                    </Link>

                    <Link 
                        href="/admin/classes"
                        className="bg-white rounded-xl p-6 hover:shadow-lg transition-all border border-blue-200"
                    >
                        <div className="text-4xl mb-3"><IconSchool size={40} stroke={1.5} /></div>
                        <h3 className="font-bold text-lg mb-2">Gérer les Classes</h3>
                        <p className="text-gray-600 text-sm">Ajouter et modifier les classes</p>
                    </Link>

                    <Link 
                        href="/profile"
                        className="bg-white rounded-xl p-6 hover:shadow-lg transition-all border border-green-200"
                    >
                        <div className="text-4xl mb-3"><IconUser size={40} stroke={1.5} /></div>
                        <h3 className="font-bold text-lg mb-2">Mon Profil</h3>
                        <p className="text-gray-600 text-sm">Gérer mes informations</p>
                    </Link>

                    {/* <Link 
                        href="/admin/migrate"
                        className="bg-white rounded-xl p-6 hover:shadow-lg transition-all border border-yellow-200 bg-yellow-50"
                    >
                        <div className="text-4xl mb-3"><IconRefresh size={40} stroke={1.5} /></div>
                        <h3 className="font-bold text-lg mb-2">Migration Firestore</h3>
                        <p className="text-gray-600 text-sm">Importer les données initiales</p>
                    </Link> */}
                </div>
            </div>
        </div>
    );
}

// Fonction utilitaire pour calculer la distribution des intérêts
function calculerDistributionInterets(resultat: ResultatQuestionnaire) {
    const sciences = ['Maths', 'Physique', 'SVT', 'NSI'];
    const humanites = ['HLP', 'HGSP', 'LLCE'];
    
    let totalSciences = 0;
    let totalHumanites = 0;
    let totalAutre = 0;

    resultat.scores.forEach((score) => {
        if (sciences.includes(score.specialite)) {
            totalSciences += score.pourcentage;
        } else if (humanites.includes(score.specialite)) {
            totalHumanites += score.pourcentage;
        } else {
            totalAutre += score.pourcentage;
        }
    });

    const total = totalSciences + totalHumanites + totalAutre;
    
    return {
        sciences: Math.round((totalSciences / total) * 100),
        humanites: Math.round((totalHumanites / total) * 100),
        autre: Math.round((totalAutre / total) * 100)
    };
}
    