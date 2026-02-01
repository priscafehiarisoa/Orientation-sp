# Configuration Firebase pour les Rôles Utilisateurs

## 📋 Structure Firestore

### Collection `users`
```
users/
  {userId}/
    - email: string
    - displayName: string
    - role: "prof" | "eleve"
    - createdAt: timestamp
    - updatedAt: timestamp
```

## 🔧 Configuration dans Firebase Console

### 1. Activer Firestore Database

1. Allez dans la [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Dans le menu, cliquez sur **Firestore Database**
4. Cliquez sur **Créer une base de données**
5. Choisissez **Mode test** (pour commencer) ou **Mode production**
6. Sélectionnez la région (europe-west par exemple)

### 2. Règles de sécurité Firestore

Allez dans l'onglet **Règles** et utilisez ces règles de base :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour la collection users
    match /users/{userId} {
      // Lecture : l'utilisateur peut lire son propre profil
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Création : uniquement à la première connexion
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Modification : l'utilisateur peut modifier son profil (sauf le rôle)
      allow update: if request.auth != null 
                    && request.auth.uid == userId
                    && request.resource.data.role == resource.data.role;
      
      // Les profs peuvent lire tous les profils
      allow read: if request.auth != null 
                  && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'prof';
    }
    
    // Exemple pour les questionnaires (à adapter selon vos besoins)
    match /questionnaires/{questionnaireId} {
      // Les profs peuvent tout faire
      allow read, write: if request.auth != null 
                         && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'prof';
      
      // Les élèves peuvent uniquement lire
      allow read: if request.auth != null 
                  && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'eleve';
    }
    
    // Exemple pour les réponses des élèves
    match /responses/{responseId} {
      // Les élèves peuvent créer et lire leurs propres réponses
      allow create, read: if request.auth != null 
                          && request.auth.uid == request.resource.data.userId;
      
      // Les profs peuvent tout lire
      allow read: if request.auth != null 
                  && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'prof';
    }
  }
}
```

### 3. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec vos identifiants Firebase :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 📱 Utilisation dans l'application

### Inscription avec rôle

L'utilisateur choisit son rôle (prof/élève) lors de l'inscription. Le profil est automatiquement créé dans Firestore.

### Vérification du rôle

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/ClientApp';

function MyComponent() {
  const [user] = useAuthState(auth);
  const { profile, loading } = useUserProfile(user);
  
  if (profile?.role === 'prof') {
    // Afficher interface prof
  } else {
    // Afficher interface élève
  }
}
```

### Protection de routes par rôle

```tsx
import RoleProtectedRoute from '@/components/RoleProtectedRoute';

export default function AdminPage() {
  return (
    <RoleProtectedRoute allowedRoles={['prof']}>
      {/* Contenu réservé aux profs */}
    </RoleProtectedRoute>
  );
}
```

## 🎯 Fonctionnalités implémentées

- ✅ Sélection du rôle à l'inscription
- ✅ Stockage du profil dans Firestore
- ✅ Hook personnalisé pour récupérer le profil
- ✅ Navigation adaptée selon le rôle
- ✅ Protection des routes par rôle
- ✅ Page d'administration pour les profs
- ✅ Dashboard différent selon le rôle

## 🔐 Sécurité

- Les rôles sont stockés dans Firestore (pas modifiables par l'utilisateur)
- Les règles Firestore empêchent la modification du rôle
- Chaque utilisateur ne peut modifier que son propre profil
- Les profs ont accès en lecture aux profils de tous les utilisateurs
