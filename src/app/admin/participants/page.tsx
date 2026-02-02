'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/ClientApp';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getTousLesResultats, getStatistiquesGlobales } from '@/services/resultatService';
import { ResultatQuestionnaire } from '@/types/questionnaire';
import { Classe } from '@/types/user';
import { IconUser, IconSchool, IconChartBar, IconClock, IconTrophy, IconSearch, IconDownload } from '@tabler/icons-react';

type StatistiquesGlobales = {
  totalParticipants: number;
  participantsParClasse: Record<string, number>;
  moyenneTemps: number;
  specialitesPlusChoisies: Array<{ specialite: string; count: number }>;
};

export default function ParticipantsPage() {
  const [user, loading] = useAuthState(auth);
  const { profile, loading: profileLoading } = useUserProfile(user);
  const router = useRouter();
  
  const [resultats, setResultats] = useState<ResultatQuestionnaire[]>([]);
  const [stats, setStats] = useState<StatistiquesGlobales | null>(null);
  const [filtreClasse, setFiltreClasse] = useState<Classe | 'toutes'>('toutes');
  const [filtreSpecialite, setFiltreSpecialite] = useState<string>('toutes');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !profileLoading) {
      if (!user || profile?.role !== 'prof') {
        router.push('/dashboard');
        return;
      }
      
      chargerDonnees();
    }
  }, [user, profile, loading, profileLoading, router]);

  const chargerDonnees = async () => {
    setIsLoadingData(true);
    try {
      const [tousResultats, statsGlobales] = await Promise.all([
        getTousLesResultats(),
        getStatistiquesGlobales()
      ]);
      
      setResultats(tousResultats);
      setStats(statsGlobales);
    } catch (error) {
      console.error('Erreur chargement données admin:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const resultatsFiltrés = resultats.filter(r => {
    const matchClasse = filtreClasse === 'toutes' || r.classe === filtreClasse;
    const matchSpecialite = filtreSpecialite === 'toutes' || 
      r.topSpecialites.some(s => s.specialite === filtreSpecialite);
    const matchSearch = searchTerm === '' || 
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchClasse && matchSpecialite && matchSearch;
  });

  const exporterCSV = () => {
    const headers = ['Nom', 'Email', 'Classe', 'Date', 'Spé 1', 'Score 1', 'Spé 2', 'Score 2', 'Spé 3', 'Score 3', 'Durée (min)'];
    const rows = resultatsFiltrés.map(r => [
      r.userName,
      r.userEmail,
      r.classe || 'N/A',
      new Date(r.date.toDate()).toLocaleDateString('fr-FR'),
      r.topSpecialites[0]?.specialite || '',
      r.topSpecialites[0]?.pourcentage || '',
      r.topSpecialites[1]?.specialite || '',
      r.topSpecialites[1]?.pourcentage || '',
      r.topSpecialites[2]?.specialite || '',
      r.topSpecialites[2]?.pourcentage || '',
      Math.round(r.dureeQuestionnaire / 60)
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `participants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const specialitesUniques = Array.from(
    new Set(resultats.flatMap(r => r.topSpecialites.map(s => s.specialite)))
  ).sort();

  const classes: Array<Classe | 'toutes'> = ['toutes', 'Seconde', 'Première', 'Terminale'];

  if (loading || profileLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-2"><IconChartBar size={32} stroke={1.5} /> Tous les Participants</h1>
          <p className="text-gray-600">Vue d'ensemble complète avec statistiques détaillées</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Participants</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalParticipants}</p>
                </div>
                <div className="text-4xl"><IconUser size={32} stroke={1.5} /></div>
              </div>
            </div>

            {/* <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Temps Moyen</p>
                  <p className="text-3xl font-bold text-green-600">
                    {Math.round(stats.moyenneTemps / 60)} min
                  </p>
                </div>
                <div className="text-4xl"><IconClock size={32} stroke={1.5} /></div>
              </div>
            </div> */}

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Spé la plus populaire</p>
                  <p className="text-lg font-bold text-purple-600">
                    {stats.specialitesPlusChoisies && stats.specialitesPlusChoisies.length > 0 
                      ? stats.specialitesPlusChoisies[0].specialite 
                      : 'N/A'}
                  </p>
                </div>
                <div className="text-4xl"><IconTrophy size={32} stroke={1.5} /></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Résultats filtrés</p>
                  <p className="text-3xl font-bold text-orange-600">{resultatsFiltrés.length}</p>
                </div>
                <div className="text-4xl"><IconSearch size={32} stroke={1.5} /> </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtres et Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom ou email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
              <select
                value={filtreClasse}
                onChange={(e) => setFiltreClasse(e.target.value as Classe | 'toutes')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {classes.map(c => (
                  <option key={c} value={c}>{c === 'toutes' ? 'Toutes' : c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
              <select
                value={filtreSpecialite}
                onChange={(e) => setFiltreSpecialite(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="toutes">Toutes</option>
                {specialitesUniques.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={exporterCSV}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
              >
                <IconDownload size={20} stroke={1.5} className="inline mr-2" /> Exporter CSV
              </button>
            </div>
          </div>
        </div>

        {/* Tableau des participants */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Top 2 Spécialités Recommandées</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resultatsFiltrés.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      Aucun résultat trouvé
                    </td>
                  </tr>
                ) : (
                  resultatsFiltrés.map((resultat, index) => (
                    <tr key={`${resultat.userId}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xl"><IconUser size={20} stroke={1.5} /></span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{resultat.userName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {resultat.userEmail}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {resultat.topSpecialites.slice(0, 3).map((spec, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-2xl">
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-gray-800">{spec.specialite}</span>
                                  <span className="text-sm font-bold text-blue-600">{spec.pourcentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${i === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}
                                    style={{ width: `${spec.pourcentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distribution par classe */}
        {stats && stats.participantsParClasse && Object.keys(stats.participantsParClasse).length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6"><IconSchool size={28} stroke={1.5} className="inline mr-2" /> Distribution par Classe</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(stats.participantsParClasse).map(([classe, count]) => (
                <div key={classe} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">{classe}</p>
                  <p className="text-2xl font-bold text-blue-600">{count} élèves</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / stats.totalParticipants) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top spécialités */}
        {stats && stats.specialitesPlusChoisies && stats.specialitesPlusChoisies.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6"><IconTrophy size={28} stroke={1.5} className="inline mr-2" /> Top 10 Spécialités Choisies</h2>
            <div className="space-y-3">
              {stats.specialitesPlusChoisies.slice(0, 10).map((spec, index) => (
                <div key={spec.specialite} className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-400 w-8">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-gray-800">{spec.specialite}</span>
                      <span className="font-bold text-blue-600">{spec.count} fois</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        style={{ 
                          width: `${stats.totalParticipants > 0 ? (spec.count / stats.totalParticipants) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
