# 🔄 Migration des utilisateurs existants vers Firestore

## Pourquoi migrer ?

Vos élèves existent déjà dans **Firebase Authentication**, mais nous avons besoin de créer leurs profils dans **Firestore** pour stocker leur rôle et autres métadonnées.

### Différence entre Firebase Auth et Firestore

| Firebase Authentication | Firestore |
|------------------------|-----------|
| Stocke : email, password, UID | Stocke : rôle, profil complet, métadonnées |
| Géré par Firebase | Géré par vous |
| Limité aux infos de connexion | Flexible, peut stocker n'importe quelle donnée |

## 📝 Étapes de migration

### Option 1 : Via l'interface web (Recommandé)

1. **Connectez-vous en tant qu'administrateur**

2. **Accédez à la page de migration**
   ```
   http://localhost:3000/admin/migrate-users
   ```

3. **Récupérez les informations de Firebase Console**
   - Allez sur https://console.firebase.google.com
   - Sélectionnez votre projet
   - Menu → **Authentication** → **Users**
   - Pour chaque utilisateur, copiez :
     - UID (identifiant unique)
     - Email
     - Nom (si disponible)

4. **Ajoutez chaque utilisateur dans l'interface**
   - Collez l'UID
   - Entrez l'email
   - Entrez le nom
   - Sélectionnez le rôle (`eleve` par défaut, `prof` pour les professeurs)

5. **Cliquez sur "Migrer"**

### Option 2 : Export CSV depuis Firebase

Si vous avez beaucoup d'utilisateurs, vous pouvez :

1. Exporter la liste depuis Firebase Console
2. Les ajouter un par un dans l'interface
3. Ou créer un script d'import batch (nous pouvons le faire ensemble)

## ✅ Vérification

Après migration, vérifiez dans Firebase Console :

1. **Firestore Database** → **users** collection
2. Vous devriez voir tous vos utilisateurs avec leurs rôles

## 🎯 Nouvelles inscriptions

À partir de maintenant :

- **Élèves** → http://localhost:3000/register/eleve
- **Professeurs** → http://localhost:3000/register/prof (avec code d'accès)

### Code d'accès professeur

Par défaut : `PROF2024`

⚠️ **À changer en production** dans le fichier :
```
src/app/register/prof/page.tsx
ligne 18: const PROF_ACCESS_CODE = 'VOTRE_CODE';
```

## 🔒 Sécurité

- Les élèves **ne peuvent pas** s'inscrire comme professeurs (code d'accès requis)
- Les rôles sont stockés dans Firestore (non modifiables par l'utilisateur)
- Les règles Firestore empêchent la modification des rôles

## 📊 Structure des données

Après migration, chaque utilisateur aura ce profil dans Firestore :

```javascript
users/{uid}/
  - uid: "abc123"
  - email: "eleve@example.com"
  - displayName: "Jean Dupont"
  - role: "eleve" ou "prof"
  - createdAt: timestamp
  - updatedAt: timestamp
  - migrated: true // Indique qu'il s'agit d'un utilisateur migré
```

## ❓ Questions fréquentes

### Que se passe-t-il si un utilisateur se reconnecte avant la migration ?

Il pourra se connecter mais n'aura pas de profil Firestore. L'application pourrait avoir des erreurs. Migrez rapidement !

### Peut-on migrer plusieurs fois le même utilisateur ?

Non, la migration échouera si le profil existe déjà (sauf si vous utilisez `merge: true`).

### Comment changer le rôle d'un utilisateur après migration ?

Via Firebase Console → Firestore Database → users → modifier le document

## 🆘 Besoin d'aide ?

Si vous avez beaucoup d'utilisateurs (>50), je peux créer un script d'import automatique depuis un fichier CSV.
