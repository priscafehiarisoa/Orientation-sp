'use client';

import { useState } from 'react';
import { envoyerMessageConseiller } from '@/services/messageService';
import { IconCheck, IconMessageCircle, IconSend } from '@tabler/icons-react';

interface ContactConseillerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  userName: string;
  topSpecialites: string[];
}

export default function ContactConseillerModal({
  isOpen,
  onClose,
  userId,
  userEmail,
  userName,
  topSpecialites
}: ContactConseillerModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Veuillez écrire un message');
      return;
    }

    setSending(true);
    setError(null);

    try {
      await envoyerMessageConseiller(
        userId,
        userEmail,
        userName,
        message,
        topSpecialites
      );
      
      setSent(true);
      setTimeout(() => {
        onClose();
        setSent(false);
        setMessage('');
      }, 2000);
    } catch (err: any) {
      console.error('Erreur envoi message:', err);
      setError(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4"><IconCheck size={48} className="inline-block text-green-600" /></div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">
              Message envoyé !
            </h3>
            <p className="text-gray-600">
              Un conseiller d'orientation te répondra bientôt
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3"><IconMessageCircle size={40} className="inline-block" /></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Contacter un Conseiller
              </h2>
              <p className="text-gray-600">
                Pose tes questions sur ton orientation
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Info sur les spécialités */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  Tes spécialités recommandées :
                </p>
                <div className="flex flex-wrap gap-2">
                  {topSpecialites.slice(0, 3).map((spec) => (
                    <span 
                      key={spec}
                      className="px-3 py-1 bg-white text-blue-700 rounded-full text-sm font-semibold"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label 
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ton message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Exemple : J'aimerais en savoir plus sur les débouchés en NSI..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={sending}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all"
                  disabled={sending}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={sending || !message.trim()}
                >
                  {sending ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Envoi...
                    </>
                  ) : (
                    <> <IconSend size={24} /> Envoyer</>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
