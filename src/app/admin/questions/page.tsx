'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/ClientApp';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  Question, 
  getAllQuestions, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion,
  archiveQuestion 
} from '@/services/questionService';
import { getAllSpecialites, SpecialiteInfo } from '@/services/specialiteService';
import { Specialite } from '@/types/questionnaire';
import { IconBox, IconEdit, IconHourglass, IconQuestionMark, IconTrash, IconX } from '@tabler/icons-react';
import Modal from '@/components/Modal';

export default function QuestionsManagementPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const { profile: userProfile, loading: loadingProfile } = useUserProfile(user);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [specialites, setSpecialites] = useState<SpecialiteInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    text: '',
    specialites: [] as Specialite[],
    poids: 2,
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
      const [fetchedQuestions, fetchedSpecialites] = await Promise.all([
        getAllQuestions(),
        getAllSpecialites()
      ]);
      setQuestions(fetchedQuestions);
      setSpecialites(fetchedSpecialites.filter(s => s.actif));
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id!, formData);
      } else {
        await createQuestion(formData);
      }
      
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Erreur sauvegarde question:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      text: question.text,
      specialites: question.specialites,
      poids: question.poids,
      actif: question.actif
    });
    setShowForm(true);
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      return;
    }

    try {
      await deleteQuestion(questionId);
      await loadData();
    } catch (error) {
      console.error('Erreur suppression question:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleArchive = async (questionId: string) => {
    try {
      await archiveQuestion(questionId);
      await loadData();
    } catch (error) {
      console.error('Erreur archivage question:', error);
      alert('Erreur lors de l\'archivage');
    }
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setFormData({
      text: '',
      specialites: [],
      poids: 2,
      actif: true
    });
    setShowForm(false);
  };

  const toggleSpecialite = (specialite: Specialite) => {
    if (formData.specialites.includes(specialite)) {
      setFormData({
        ...formData,
        specialites: formData.specialites.filter(s => s !== specialite)
      });
    } else {
      setFormData({
        ...formData,
        specialites: [...formData.specialites, specialite]
      });
    }
  };

  const filteredQuestions = showArchived ? questions : questions.filter(q => q.actif);

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
          <div className="text-6xl mb-4"><IconX size={48} stroke={1.5} color='red'/></div>
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
              <h1 className="text-3xl font-bold text-gray-800">Gestion des Questions</h1>
              <p className="text-gray-600 mt-2">Créez et gérez les questions du questionnaire</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              + Nouvelle Question
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <Modal
          isOpen={showForm}
          onClose={resetForm}
          title={editingQuestion ? 'Modifier la question' : 'Créer une nouvelle question'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question *
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={3}
                  placeholder="Ex: Résoudre des équations complexes"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spécialités liées * (sélectionnez au moins une)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {specialites.map((spec) => (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => toggleSpecialite(spec.nom as Specialite)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.specialites.includes(spec.nom as Specialite)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{spec.emoji}</div>
                      <div className="text-sm font-medium">{spec.nom}</div>
                    </button>
                  ))}
                </div>
                {formData.specialites.length === 0 && (
                  <p className="text-red-600 text-sm mt-2">Sélectionnez au moins une spécialité</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poids de la question (1-3) *
                </label>
                <div className="flex gap-4">
                  {[1, 2, 3].map((weight) => (
                    <button
                      key={weight}
                      type="button"
                      onClick={() => setFormData({ ...formData, poids: weight })}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        formData.poids === weight
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {weight} - {weight === 1 ? 'Faible' : weight === 2 ? 'Moyen' : 'Fort'}
                    </button>
                  ))}
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
                  Question active (visible dans le questionnaire)
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={formData.specialites.length === 0}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingQuestion ? 'Mettre à jour' : 'Créer'}
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
              {filteredQuestions.length} question{filteredQuestions.length > 1 ? 's' : ''}
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
                Afficher les questions archivées
              </label>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4"><IconHourglass size={32} stroke={1.5} /></div>
              <p className="text-gray-600">Chargement des questions...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4"><IconQuestionMark size={48} stroke={1.5} /></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune question</h3>
              <p className="text-gray-600">Créez votre première question pour commencer</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredQuestions.map((question) => (
                <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-lg font-medium text-gray-900">{question.text}</p>
                        {!question.actif && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Archivée</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Poids:</span> {question.poids}/3
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Spécialités:</span> {question.specialites.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {question.specialites.map((spec) => {
                          const specInfo = specialites.find(s => s.nom === spec);
                          return (
                            <span
                              key={spec}
                              className="px-3 py-1 rounded-full text-sm font-medium"
                              style={{
                                backgroundColor: specInfo?.couleur + '20',
                                color: specInfo?.couleur
                              }}
                            >
                              {specInfo?.emoji} {spec}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(question)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-all"
                      >
                        <IconEdit size={16} stroke={1.5} /> Modifier
                      </button>
                      {question.actif && (
                        <button
                          onClick={() => handleArchive(question.id!)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
                        >
                          <IconBox size={16} stroke={1.5} /> Archiver
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(question.id!)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all"
                      >
                        <IconTrash size={16} stroke={1.5} /> Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-blue-600">{questions.length}</div>
            <div className="text-gray-600 mt-1">Questions totales</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-green-600">
              {questions.filter(q => q.actif).length}
            </div>
            <div className="text-gray-600 mt-1">Questions actives</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-gray-600">
              {questions.filter(q => !q.actif).length}
            </div>
            <div className="text-gray-600 mt-1">Questions archivées</div>
          </div>
        </div>
      </div>
    </div>
  );
}
