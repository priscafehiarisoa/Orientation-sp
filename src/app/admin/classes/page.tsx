'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/ClientApp';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  Classe, 
  getAllClasses, 
  createClasse, 
  updateClasse, 
  deleteClasse,
  archiveClasse 
} from '@/services/classeService';
import { Timestamp } from 'firebase/firestore';
import { IconBan, IconBook, IconBox, IconHourglass, IconPencil, IconTrash } from '@tabler/icons-react';
import Modal from '@/components/Modal';

export default function ClassesManagementPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const { profile: userProfile, loading: loadingProfile } = useUserProfile(user);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClasse, setEditingClasse] = useState<Classe | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'Seconde' | 'Première' | 'Terminale'>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nom: '',
    niveau: 'Seconde' as 'Seconde' | 'Première' | 'Terminale',
    specialite: '',
    annee: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    actif: true
  });

  useEffect(() => {
    if (userProfile?.role !== 'prof') {
      return;
    }
    loadClasses();
  }, [userProfile]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const fetchedClasses = await getAllClasses();
      setClasses(fetchedClasses);
    } catch (error) {
      console.error('Erreur chargement classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClasse) {
        await updateClasse(editingClasse.id!, formData);
      } else {
        await createClasse({
          ...formData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
      
      await loadClasses();
      resetForm();
    } catch (error) {
      console.error('Erreur sauvegarde classe:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (classe: Classe) => {
    setEditingClasse(classe);
    setFormData({
      nom: classe.nom,
      niveau: classe.niveau,
      specialite: classe.specialite || '',
      annee: classe.annee,
      actif: classe.actif
    });
    setShowForm(true);
  };

  const handleDelete = async (classeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
      return;
    }

    try {
      await deleteClasse(classeId);
      await loadClasses();
    } catch (error) {
      console.error('Erreur suppression classe:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleArchive = async (classeId: string) => {
    try {
      await archiveClasse(classeId);
      await loadClasses();
    } catch (error) {
      console.error('Erreur archivage classe:', error);
      alert('Erreur lors de l\'archivage');
    }
  };

  const resetForm = () => {
    setEditingClasse(null);
    setFormData({
      nom: '',
      niveau: 'Seconde',
      specialite: '',
      annee: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      actif: true
    });
    setShowForm(false);
  };

  const filteredClasses = classes.filter(classe => {
    const matchesNiveau = filter === 'all' || classe.niveau === filter;
    const matchesActif = showArchived || classe.actif;
    return matchesNiveau && matchesActif;
  });

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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gestion des Classes</h1>
              <p className="text-gray-600 mt-2">Créez et gérez les classes de l'établissement</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              + Nouvelle Classe
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <Modal
          isOpen={showForm}
          onClose={resetForm}
          title={editingClasse ? 'Modifier la classe' : 'Créer une nouvelle classe'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la classe *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: Seconde A, Première S1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau *
                  </label>
                  <select
                    value={formData.niveau}
                    onChange={(e) => setFormData({ ...formData, niveau: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Seconde">Seconde</option>
                    <option value="Première">Première</option>
                    <option value="Terminale">Terminale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spécialité (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.specialite}
                    onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                    placeholder="Ex: Générale, STI2D, STMG"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année scolaire *
                  </label>
                  <input
                    type="text"
                    value={formData.annee}
                    onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                    placeholder="2024-2025"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="actif"
                  checked={formData.actif}
                  onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="actif" className="ml-2 text-sm text-gray-700">
                  Classe active (visible pour les inscriptions)
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  {editingClasse ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  Annuler
                </button>
              </div>
            </form>
        </Modal>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilter('Seconde')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'Seconde' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Seconde
              </button>
              <button
                onClick={() => setFilter('Première')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'Première' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Première
              </button>
              <button
                onClick={() => setFilter('Terminale')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'Terminale' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Terminale
              </button>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showArchived"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="showArchived" className="ml-2 text-sm text-gray-700">
                Afficher les classes archivées
              </label>
            </div>
          </div>
        </div>

        {/* Classes List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4"><IconHourglass size={32} stroke={1.5} /></div>
              <p className="text-gray-600">Chargement des classes...</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4"><IconBook size={48} stroke={1.5} /></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune classe</h3>
              <p className="text-gray-600">Créez votre première classe pour commencer</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nom</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Niveau</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Spécialité</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Année</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredClasses.map((classe) => (
                    <tr key={classe.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{classe.nom}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          classe.niveau === 'Seconde' ? 'bg-green-100 text-green-800' :
                          classe.niveau === 'Première' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {classe.niveau}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {classe.specialite || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {classe.annee}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          classe.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {classe.actif ? '✓ Active' : '✕ Archivée'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(classe)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-all"
                          >
                            <IconPencil size={16} stroke={1.5} /> Modifier
                          </button>
                          {classe.actif && (
                            <button
                              onClick={() => handleArchive(classe.id!)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
                            >
                              <IconBox size={16} stroke={1.5} /> Archiver
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(classe.id!)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all"
                          >
                            <IconTrash size={16} stroke={1.5} /> Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-blue-600">{classes.length}</div>
            <div className="text-gray-600 mt-1">Classes totales</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-green-600">
              {classes.filter(c => c.actif).length}
            </div>
            <div className="text-gray-600 mt-1">Classes actives</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-gray-600">
              {classes.filter(c => !c.actif).length}
            </div>
            <div className="text-gray-600 mt-1">Classes archivées</div>
          </div>
        </div>
      </div>
    </div>
  );
}
