import { db } from '@/firebase/ClientApp';
import { collection, doc, setDoc, getDocs, query, where, orderBy, Timestamp, updateDoc } from 'firebase/firestore';

export interface MessageConseiller {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  message: string;
  topSpecialites: string[];
  status: 'nouveau' | 'lu' | 'repondu';
  reponse?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Envoie un message au conseiller
 */
export async function envoyerMessageConseiller(
  userId: string,
  userEmail: string,
  userName: string,
  message: string,
  topSpecialites: string[]
): Promise<string> {
  try {
    const messagesRef = collection(db, 'messages_conseillers');
    const messageDoc = doc(messagesRef);

    const data: Omit<MessageConseiller, 'id'> = {
      userId,
      userEmail,
      userName,
      message,
      topSpecialites,
      status: 'nouveau',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(messageDoc, data);
    console.log('✅ Message envoyé au conseiller');
    return messageDoc.id;
  } catch (error) {
    console.error('❌ Erreur envoi message:', error);
    throw error;
  }
}

/**
 * Récupère les messages d'un utilisateur
 */
export async function getMessagesUtilisateur(userId: string): Promise<MessageConseiller[]> {
  try {
    const messagesRef = collection(db, 'messages_conseillers');
    const q = query(
      messagesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const messages: MessageConseiller[] = [];

    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as MessageConseiller);
    });

    return messages;
  } catch (error) {
    console.error('❌ Erreur récupération messages:', error);
    throw error;
  }
}

/**
 * Récupère tous les messages (pour les profs/conseillers)
 */
export async function getTousLesMessages(status?: 'nouveau' | 'lu' | 'repondu'): Promise<MessageConseiller[]> {
  try {
    const messagesRef = collection(db, 'messages_conseillers');
    let q;

    if (status) {
      q = query(
        messagesRef,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(messagesRef, orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const messages: MessageConseiller[] = [];

    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as MessageConseiller);
    });

    return messages;
  } catch (error) {
    console.error('❌ Erreur récupération tous les messages:', error);
    throw error;
  }
}

/**
 * Marque un message comme lu
 */
export async function marquerMessageLu(messageId: string): Promise<void> {
  try {
    const messageRef = doc(db, 'messages_conseillers', messageId);
    await updateDoc(messageRef, {
      status: 'lu',
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('❌ Erreur marquage message lu:', error);
    throw error;
  }
}

/**
 * Répond à un message
 */
export async function repondreMessage(messageId: string, reponse: string): Promise<void> {
  try {
    const messageRef = doc(db, 'messages_conseillers', messageId);
    await updateDoc(messageRef, {
      status: 'repondu',
      reponse,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('❌ Erreur réponse message:', error);
    throw error;
  }
}
