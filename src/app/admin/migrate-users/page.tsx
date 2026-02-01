'use client';
import { useState } from 'react';
import { migrateUser, MigrationUser } from '@/scripts/migrateUsers';

/**
 * Page d'administration pour migrer les utilisateurs existants
 * Accessible uniquement aux administrateurs
 * 
 * URL: /admin/migrate-users
 */
export default function MigrateUsersPage() {
    const [users, setUsers] = useState<MigrationUser[]>([]);
    const [currentUser, setCurrentUser] = useState<Partial<MigrationUser>>({
        role: 'eleve'
    });
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const addUser = () => {
        if (currentUser.uid && currentUser.email) {
            setUsers([...users, currentUser as MigrationUser]);
            setCurrentUser({ role: 'eleve' });
            setStatus(`Utilisateur ajouté: ${currentUser.email}`);
        } else {
            setStatus('❌ UID et Email sont requis');
        }
    };

    const migrateAllUsers = async () => {
        if (users.length === 0) {
            setStatus('❌ Aucun utilisateur à migrer');
            return;
        }

        setLoading(true);
        setStatus('Migration en cours...');
        
        try {
            for (const user of users) {
                await migrateUser(user);
            }
            setStatus(`✅ Migration réussie de ${users.length} utilisateur(s)`);
            setUsers([]);
        } catch (error) {
            setStatus('❌ Erreur lors de la migration');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const removeUser = (index: number) => {
        setUsers(users.filter((_, i) => i !== index));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Migration des utilisateurs existants</h1>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Instructions importantes</h3>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li>Récupérez les UID et emails depuis Firebase Authentication</li>
                    <li>Par défaut, les utilisateurs sont créés comme "élève"</li>
                    <li>Sélectionnez "prof" pour les professeurs</li>
                    <li>Cette opération ne peut être effectuée qu'une seule fois par utilisateur</li>
                </ul>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Ajouter un utilisateur</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">UID (depuis Firebase Auth)</label>
                        <input
                            type="text"
                            value={currentUser.uid || ''}
                            onChange={(e) => setCurrentUser({ ...currentUser, uid: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="abc123xyz456"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={currentUser.email || ''}
                            onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="email@exemple.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Nom complet</label>
                        <input
                            type="text"
                            value={currentUser.displayName || ''}
                            onChange={(e) => setCurrentUser({ ...currentUser, displayName: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Jean Dupont"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Rôle</label>
                        <select
                            value={currentUser.role}
                            onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value as 'prof' | 'eleve' })}
                            className="w-full px-3 py-2 border rounded"
                        >
                            <option value="eleve">Élève</option>
                            <option value="prof">Professeur</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={addUser}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Ajouter à la liste
                </button>
            </div>

            {users.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Utilisateurs à migrer ({users.length})</h2>
                    
                    <div className="space-y-2">
                        {users.map((user, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div>
                                    <p className="font-medium">{user.email}</p>
                                    <p className="text-sm text-gray-600">
                                        {user.displayName} - {user.role === 'prof' ? 'Professeur' : 'Élève'}
                                    </p>
                                    <p className="text-xs text-gray-500">UID: {user.uid}</p>
                                </div>
                                <button
                                    onClick={() => removeUser(index)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    Supprimer
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={migrateAllUsers}
                        disabled={loading}
                        className="mt-4 w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 disabled:opacity-50 font-semibold"
                    >
                        {loading ? 'Migration en cours...' : `Migrer ${users.length} utilisateur(s)`}
                    </button>
                </div>
            )}

            {status && (
                <div className={`p-4 rounded ${status.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {status}
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h3 className="font-semibold text-blue-800 mb-2">💡 Comment récupérer les UID ?</h3>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Allez sur <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
                    <li>Sélectionnez votre projet</li>
                    <li>Menu → Authentication → Users</li>
                    <li>Copiez l'UID de chaque utilisateur</li>
                </ol>
            </div>
        </div>
    );
}
