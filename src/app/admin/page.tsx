'use client';

import RoleProtectedRoute from '@/components/RoleProtectedRoute';

export default function AdminPage() {
    return (
        <RoleProtectedRoute allowedRoles={['prof']}>
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6">Espace Administration - Professeurs</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Gestion des questionnaires</h2>
                        <p className="text-gray-600 mb-4">Créez et modifiez les questionnaires pour vos élèves.</p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Créer un questionnaire
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Résultats des élèves</h2>
                        <p className="text-gray-600 mb-4">Consultez les résultats et statistiques.</p>
                        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                            Voir les résultats
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Gestion des élèves</h2>
                        <p className="text-gray-600 mb-4">Voir la liste des élèves inscrits.</p>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                            Liste des élèves
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
                        <p className="text-gray-600 mb-4">Visualisez les statistiques globales.</p>
                        <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                            Voir les stats
                        </button>
                    </div>
                </div>
            </div>
        </RoleProtectedRoute>
    );
}
