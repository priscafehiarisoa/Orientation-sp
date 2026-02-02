'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/ClientApp';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  SpecialiteInfo,
  getAllSpecialites,
  createSpecialite,
  updateSpecialite,
  deleteSpecialite,
  archiveSpecialite
} from '@/services/specialiteService';
import { IconBan, IconBooks, IconBox, IconEdit, IconHourglass, IconTrash } from '@tabler/icons-react';
import Modal from '@/components/Modal';

export default function SpecialitesManagementPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const { profile: userProfile, loading: loadingProfile } = useUserProfile(user);
  const [specialites, setSpecialites] = useState<SpecialiteInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSpecialite, setEditingSpecialite] = useState<SpecialiteInfo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nom: '',
    emoji: '',
    couleur: '#3B82F6',
    description: '',
    metiers: [''],
    etudes: [''],
    actif: true
  });

  useEffect(() => {
    if (userProfile?.role !== 'prof') {
      return;
    }
    loadData();
  }, [userProfile]);

  const loadData = async () => {
    try {
      setLoading(true);
      const fetchedSpecialites = await getAllSpecialites();
      setSpecialites(fetchedSpecialites);
    } catch (error) {
      console.error('Erreur chargement spécialités:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean empty strings from arrays
    const cleanedData = {
      ...formData,
      metiers: formData.metiers.filter(m => m.trim() !== ''),
      etudes: formData.etudes.filter(e => e.trim() !== '')
    };

    try {
      if (editingSpecialite) {
        await updateSpecialite(editingSpecialite.id!, cleanedData);
      } else {
        await createSpecialite(cleanedData);
      }

      await loadData();
      resetForm();
    } catch (error) {
      console.error('Erreur sauvegarde spécialité:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (specialite: SpecialiteInfo) => {
    setEditingSpecialite(specialite);
    setFormData({
      nom: specialite.nom,
      emoji: specialite.emoji,
      couleur: specialite.couleur,
      description: specialite.description,
      metiers: specialite.metiers.length > 0 ? specialite.metiers : [''],
      etudes: specialite.etudes.length > 0 ? specialite.etudes : [''],
      actif: specialite.actif
    });
    setShowForm(true);
  };

  const handleDelete = async (specialiteId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette spécialité ? Cette action est irréversible.')) {
      return;
    }

    try {
      await deleteSpecialite(specialiteId);
      await loadData();
    } catch (error) {
      console.error('Erreur suppression spécialité:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleArchive = async (specialiteId: string) => {
    try {
      await archiveSpecialite(specialiteId);
      await loadData();
    } catch (error) {
      console.error('Erreur archivage spécialité:', error);
      alert('Erreur lors de l\'archivage');
    }
  };

  const resetForm = () => {
    setEditingSpecialite(null);
    setFormData({
      nom: '',
      emoji: '',
      couleur: '#3B82F6',
      description: '',
      metiers: [''],
      etudes: [''],
      actif: true
    });
    setShowForm(false);
  };

  const addArrayItem = (field: 'metiers' | 'etudes') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const updateArrayItem = (field: 'metiers' | 'etudes', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  const removeArrayItem = (field: 'metiers' | 'etudes', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  const filteredSpecialites = showArchived ? specialites : specialites.filter(s => s.actif);

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
          <div className="text-6xl mb-4"><IconBan size={48} stroke={1.5} color='red'/></div>
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
              <h1 className="text-3xl font-bold text-gray-800">Gestion des Spécialités</h1>
              <p className="text-gray-600 mt-2">Créez et gérez les spécialités pour le questionnaire d'orientation</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              + Nouvelle Spécialité
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <Modal
          isOpen={showForm}
          onClose={resetForm}
          title={editingSpecialite ? 'Modifier la spécialité' : 'Créer une nouvelle spécialité'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la spécialité *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: Scientifique"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    placeholder="Ex: 🔬"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-2xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur *
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={formData.couleur}
                    onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                    className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.couleur}
                    onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                    placeholder="#3B82F6"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div
                    className="h-12 w-32 rounded-lg border-2 border-gray-300 flex items-center justify-center text-2xl font-bold"
                    style={{ backgroundColor: formData.couleur }}
                  >
                    {formData.emoji}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Description de la spécialité..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Métiers associés
                </label>
                {formData.metiers.map((metier, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={metier}
                      onChange={(e) => updateArrayItem('metiers', index, e.target.value)}
                      placeholder="Ex: Chercheur, Médecin..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.metiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('metiers', index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('metiers')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Ajouter un métier
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Études recommandées
                </label>
                {formData.etudes.map((etude, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={etude}
                      onChange={(e) => updateArrayItem('etudes', index, e.target.value)}
                      placeholder="Ex: Licence en sciences..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.etudes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('etudes', index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('etudes')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Ajouter une étude
                </button>
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
                  Spécialité active (visible dans le questionnaire)
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  {editingSpecialite ? 'Mettre à jour' : 'Créer'}
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
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredSpecialites.length} spécialité{filteredSpecialites.length > 1 ? 's' : ''}
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
                Afficher les spécialités archivées
              </label>
            </div>
          </div>
        </div>

        {/* Specialites Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-4xl mb-4"><IconHourglass size={32} stroke={1.5} /></div>
            <p className="text-gray-600">Chargement des spécialités...</p>
          </div>
        ) : filteredSpecialites.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4"><IconBooks size={48} stroke={1.5} /></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune spécialité</h3>
            <p className="text-gray-600">Créez votre première spécialité pour commencer</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSpecialites.map((specialite) => (
              <div
                key={specialite.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div
                  className="h-3"
                  style={{ backgroundColor: specialite.couleur }}
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{specialite.emoji}</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{specialite.nom}</h3>
                        {!specialite.actif && (
                          <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">Archivée</span>
                        )}
                      </div>
                    </div>
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: specialite.couleur }}
                    />
                  </div>

                  <p className="text-gray-600 mb-4">{specialite.description}</p>

                  {specialite.metiers.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Métiers:</h4>
                      <div className="flex flex-wrap gap-2">
                        {specialite.metiers.map((metier, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {metier}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {specialite.etudes.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Études:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {specialite.etudes.map((etude, index) => (
                          <li key={index}>• {etude}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(specialite)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-all"
                    >
                      <IconEdit size={16} stroke={1.5} /> Modifier
                    </button>
                    {specialite.actif && (
                      <button
                        onClick={() => handleArchive(specialite.id!)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
                      >
                        <IconBox size={16} stroke={1.5} /> Archiver
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(specialite.id!)}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all"
                    >
                      <IconTrash size={16} stroke={1.5} /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-blue-600">{specialites.length}</div>
            <div className="text-gray-600 mt-1">Spécialités totales</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-green-600">
              {specialites.filter(s => s.actif).length}
            </div>
            <div className="text-gray-600 mt-1">Spécialités actives</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-gray-600">
              {specialites.filter(s => !s.actif).length}
            </div>
            <div className="text-gray-600 mt-1">Spécialités archivées</div>
          </div>
        </div>
      </div>
    </div>
  );
}
