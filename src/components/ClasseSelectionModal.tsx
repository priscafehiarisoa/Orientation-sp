'use client';

import { useEffect, useState } from 'react';
import { Classe } from '@/services/classeService';
import { updateUserProfile } from '@/services/userService';

interface ClasseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  classes: Classe[];
  onClasseSelected: (classeId: string) => void;
}

export default function ClasseSelectionModal({
  isOpen,
  onClose,
  userId,
  classes,
  onClasseSelected
}: ClasseSelectionModalProps) {
  const [selectedClasse, setSelectedClasse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClasse) {
      setError('Veuillez sélectionner une classe');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedClasseObj = classes.find(c => c.id === selectedClasse);
      await updateUserProfile(userId, { 
        classe: selectedClasseObj?.nom || null 
      });
      
      onClasseSelected(selectedClasse);
      onClose();
    } catch (err) {
      console.error('Erreur mise à jour classe:', err);
      setError('Erreur lors de la mise à jour de votre classe');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          // Empêcher la fermeture en cliquant à l'extérieur
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="text-5xl mb-3">🎓</div>
          <h2 className="text-2xl font-bold text-gray-800">Sélectionnez votre classe</h2>
          <p className="text-gray-600 mt-2">
            Veuillez indiquer votre classe pour continuer
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="classe" className="block text-sm font-medium text-gray-700 mb-2">
              Classe *
            </label>
            <select
              id="classe"
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Choisir une classe --</option>
              {classes.map((classe) => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom} {classe.specialite && `(${classe.specialite})`}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enregistrement...' : 'Valider'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Cette information est nécessaire pour personnaliser votre expérience
        </p>
      </div>
    </div>
  );
}
