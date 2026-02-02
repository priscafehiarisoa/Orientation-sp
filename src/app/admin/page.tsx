'use client';

import { useEffect, useState } from 'react';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import { IconChartPie, IconDashboard, IconQuestionMark } from '@tabler/icons-react';
import Link from 'next/link';

interface Stats {
    totalParticipants: number;
    questionsActives: number;
}

export default function AdminPage() {
    const [stats, setStats] = useState<Stats>({
        totalParticipants: 0,
        questionsActives: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        chargerStatistiques();
    }, []);

    const chargerStatistiques = async () => {
        try {
            const [resultatService, messageService, questionService] = await Promise.all([
                import('@/services/resultatService'),
                import('@/services/messageService'),
                import('@/services/questionService')
            ]);

            const [statsGlobales, questions] = await Promise.all([
                resultatService.getStatistiquesGlobales(),
                questionService.getAllQuestions()
            ]);

            setStats({
                totalParticipants: statsGlobales.totalParticipants,
                questionsActives: questions.filter(q => q.actif).length
            });
        } catch (error) {
            console.error('Erreur chargement statistiques:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <RoleProtectedRoute allowedRoles={['prof']}>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-2"><IconDashboard size={40} stroke={1.5} /> Espace Administration</h1>
                    <p className="text-gray-600 mb-8">Tableau de bord pour les professeurs</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/admin/participants">
                            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-5xl"><IconChartPie size={40} stroke={1.5} /></div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">Participants & Stats</h2>
                                        <p className="text-gray-500">Vue complète</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Consultez la liste complète des participants, leurs résultats, statistiques détaillées et exportez les données.
                                </p>
                                <div className="flex items-center text-blue-600 font-semibold">
                                    Accéder
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>

                        <Link href="/admin/questions">
                            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-500">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-5xl"><IconQuestionMark size={40} stroke={1.5} /></div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">Gestion Questions</h2>
                                        <p className="text-gray-500">CRUD complet</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Créez, modifiez et supprimez les questions du questionnaire d'orientation.
                                </p>
                                <div className="flex items-center text-purple-600 font-semibold">
                                    Accéder
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>

                        {/* <Link href="/admin/messages">
                            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-green-500">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-5xl"><IconMessageCircle size={40} stroke={1.5} /></div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">Messages Élèves</h2>
                                        <p className="text-gray-500">Communication</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Consultez et répondez aux messages des élèves demandant des conseils d'orientation.
                                </p>
                                <div className="flex items-center text-green-600 font-semibold">
                                    Accéder
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link> */}

                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-5xl"><IconChartPie size={40} stroke={1.5} /></div>
                                <div>
                                    <h2 className="text-2xl font-bold">Statistiques Rapides</h2>
                                </div>
                            </div>
                            <div className="space-y-3 mt-6">
                                <div className="flex justify-between items-center">
                                    <span>Total participants</span>
                                    <span className="text-2xl font-bold">
                                        {loading ? '...' : stats.totalParticipants}
                                    </span>
                                </div>
                                {/* <div className="flex justify-between items-center">
                                    <span>Messages en attente</span>
                                    <span className="text-2xl font-bold">
                                        {loading ? '...' : stats.messagesEnAttente}
                                    </span>
                                </div> */}
                                <div className="flex justify-between items-center">
                                    <span>Questions actives</span>
                                    <span className="text-2xl font-bold">
                                        {loading ? '...' : stats.questionsActives}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RoleProtectedRoute>
    );
}
