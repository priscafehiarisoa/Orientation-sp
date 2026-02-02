'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/ClientApp';
import { useUserProfile } from '@/hooks/useUserProfile';
import { updateUserProfile, UserProfile } from '@/services/userService';
import { getAllClasses } from '@/services/classeService';
import Link from 'next/link';
import { updateProfile } from 'firebase/auth';
import { IconBan, IconChalkboard, IconChalkboardTeacher, IconHome, IconHourglass, IconListNumbers, IconPencil, IconSchool, IconUsers, IconX } from '@tabler/icons-react';

export default function ProfilePage() {
  const [user, loadingAuth] = useAuthState(auth);
  const { profile, loading: loadingProfile, refresh } = useUserProfile(user);
  const [classes, setClasses] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    classe: '',
    age: 0
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        email: profile.email || '',
        classe: profile.classe || '',
        age: profile.age || 0
      });
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.role === 'eleve') {
      loadClasses();
    }
  }, [profile]);

  const loadClasses = async () => {
    try {
      const fetchedClasses = await getAllClasses();
      setClasses(fetchedClasses.filter(c => c.actif));
    } catch (error) {
      console.error('Erreur chargement classes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Mise à jour Firebase Auth displayName
      if (user && formData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: formData.displayName
        });
      }

      // Mise à jour Firestore profile
      const updates: Partial<UserProfile> = {
        displayName: formData.displayName
      };

      if (profile?.role === 'eleve') {
        updates.classe = formData.classe || null;
        updates.age = formData.age > 0 ? formData.age : null;
      }

      await updateUserProfile(profile!.uid, updates);
      await refresh();

      setSuccessMessage(' Profil mis à jour avec succès !');
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      setErrorMessage(' Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      displayName: profile?.displayName || '',
      email: profile?.email || '',
      classe: profile?.classe || '',
      age: profile?.age || 0
    });
    setErrorMessage('');
  };

  if (loadingAuth || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4"><IconHourglass size={48} stroke={1.5} /></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4"><IconBan size={48} stroke={1.5} /></div>
          <h1 className="text-2xl font-bold text-gray-800">Non connecté</h1>
          <p className="text-gray-600 mt-2">Veuillez vous connecter pour accéder à votre profil</p>
          <Link
            href="/login"
            className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const roleIcon = profile.role === 'prof' ? <IconChalkboardTeacher size={48} stroke={1.5} /> : <IconSchool size={48} stroke={1.5} />;
  const roleLabel = profile.role === 'prof' ? 'Professeur' : 'Élève';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{roleIcon}</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Mon Profil</h1>
                <p className="text-gray-600 mt-1">Gérez vos informations personnelles</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                <IconPencil size={24} stroke={1.5} /> Modifier
              </button>
            )}
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {isEditing ? (
            // Edit Mode
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'affichage *
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre nom"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-sm text-gray-500 mt-1">L'email ne peut pas être modifié</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-3xl">{roleIcon}</span>
                  <span className="font-semibold text-gray-800">{roleLabel}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Le rôle ne peut pas être modifié</p>
              </div>

              {profile.role === 'eleve' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Classe
                    </label>
                    <select
                      value={formData.classe}
                      onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sélectionnez votre classe</option>
                      {classes.map((classe) => (
                        <option key={classe.id} value={classe.nom}>
                          {classe.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Âge
                    </label>
                    <input
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Votre âge"
                      min="10"
                      max="99"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? '<IconHourglass size={48} stroke={1.5} /> Enregistrement...' : '💾 Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:cursor-not-allowed"
                >
                  <IconX size={24} stroke={1.5} className="inline mr-2" /> Annuler
                </button>
              </div>
            </form>
          ) : (
            // View Mode
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">Nom d'affichage</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {profile.displayName || 'Non renseigné'}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">Email</div>
                  <div className="text-lg font-semibold text-gray-900">{profile.email}</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">Rôle</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{roleIcon}</span>
                    <span className="text-lg font-semibold text-gray-900">{roleLabel}</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">ID Utilisateur</div>
                  <div className="text-sm font-mono text-gray-700 truncate">
                    {profile.uid}
                  </div>
                </div>
              </div>

              {profile.role === 'eleve' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-700 mb-1">Classe</div>
                    <div className="text-lg font-semibold text-blue-900">
                      {profile.classe || 'Non renseignée'}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-700 mb-1">Âge</div>
                    <div className="text-lg font-semibold text-blue-900">
                      {profile.age ? `${profile.age} ans` : 'Non renseigné'}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Compte créé le:</span>{' '}
                    {profile.createdAt instanceof Date
                      ? profile.createdAt.toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Non disponible'}
                  </div>
                  <div>
                    <span className="font-medium">Dernière modification:</span>{' '}
                    {profile.updatedAt instanceof Date
                      ? profile.updatedAt.toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Non disponible'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Actions rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all"
              >
                <IconHome size={24} stroke={1.5} />
                <div>
                  <div className="font-semibold text-blue-900">Tableau de bord</div>
                  <div className="text-sm text-blue-700">Retour à l'accueil</div>
                </div>
              </Link>

              {profile.role === 'eleve' && (
                <Link
                  href="/questionnaires"
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all"
                >
                  <IconListNumbers size={24} stroke={1.5} />
                  <div>
                    <div className="font-semibold text-green-900">Questionnaire</div>
                    <div className="text-sm text-green-700">Découvrir mes spécialités</div>
                  </div>
                </Link>
              )}

              {profile.role === 'prof' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all"
                >
                  <IconUsers size={24} stroke={1.5} />
                  <div>
                    <div className="font-semibold text-purple-900">Gestion</div>
                    <div className="text-sm text-purple-700">Voir les participants</div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
