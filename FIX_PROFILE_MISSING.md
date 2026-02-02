# 🔧 FIX : Profil utilisateur manquant

## Problème identifié

Vous restez bloqué sur la page login car **votre profil Firestore n'existe pas**.

**Firebase Auth** : ✅ Utilisateur créé  
**Firestore `users`** : ❌ Profil manquant

## Solution rapide (Console navigateur)

### Option 1 : Créer le profil manuellement via console

1. Ouvrez la console du navigateur (F12)
2. Connectez-vous à votre compte
3. Copiez-collez ce code :

```javascript
// Importez Firebase
import { auth, db } from './src/firebase/ClientApp.tsx';
import { doc, setDoc } from 'firebase/firestore';

// Créez le profil
const user = auth.currentUser;
if (user) {
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email.split('@')[0],
    role: 'eleve', // ou 'prof'
    classe: null,
    age: null,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  console.log('✅ Profil créé !');
  window.location.href = '/dashboard';
}
```

### Option 2 : Créer le profil via Firebase Console

1. Allez sur **Firebase Console** → **Firestore Database**
2. Créez une collection `users`
3. Créez un document avec l'ID de votre utilisateur (UID)
4. Ajoutez les champs suivants :

```json
{
  "uid": "VOTRE_UID",
  "email": "votre@email.com",
  "displayName": "Votre Nom",
  "role": "eleve",
  "classe": null,
  "age": null,
  "createdAt": "2026-02-01T10:00:00Z",
  "updatedAt": "2026-02-01T10:00:00Z"
}
```

### Option 3 : Créer une page de diagnostic

J'ai créé un fichier `src/scripts/createMissingProfiles.ts` que vous pouvez utiliser.

## Prévention future

Pour éviter ce problème à l'avenir, assurez-vous que **chaque inscription crée bien le profil Firestore**.

Vérifiez dans :
- `src/app/register/eleve/page.tsx` → ligne avec `createUserProfile()`
- `src/app/register/prof/page.tsx` → ligne avec `createUserProfile()`
- `src/app/login/page.tsx` → Ajoutez une création de profil si manquant

## Vérification rapide

Pour vérifier si votre profil existe :

```javascript
// Console navigateur
import { auth, db } from './src/firebase/ClientApp.tsx';
import { doc, getDoc } from 'firebase/firestore';

const user = auth.currentUser;
if (user) {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  console.log('Profil existe?', snap.exists());
  if (snap.exists()) {
    console.log('Données:', snap.data());
  }
}
```

## Comment obtenir votre UID ?

1. Console navigateur → F12
2. Tapez : `auth.currentUser?.uid`
3. Copiez l'UID affiché
