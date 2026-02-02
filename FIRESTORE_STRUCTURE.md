# Structure Firestore - Chemins de Spé

## Collections Principales

### 1. `users` (Collection)
Profils utilisateurs (élèves et profs)

**Document ID:** `{userId}` (UID Firebase Auth)

**Structure:**
```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "role": "eleve" | "prof",
  "classe": "seconde" | "premiere" | null,
  "age": number | null,
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

---

### 2. `resultats_questionnaires` (Collection)
Résultats des questionnaires passés par les élèves

**Document ID:** `{userId}_{timestamp}`

**Structure:**
```json
{
  "userId": "string",
  "userEmail": "string",
  "userName": "string",
  "classe": "seconde" | "premiere" | null,
  "date": timestamp,
  "reponses": [
    {
      "questionId": number,
      "score": 1-5
    }
  ],
  "scores": [
    {
      "specialite": "string",
      "score": number,
      "pourcentage": number
    }
  ],
  "topSpecialites": [
    {
      "specialite": "string",
      "score": number,
      "pourcentage": number
    }
  ],
  "dureeQuestionnaire": number // en secondes
}
```

---

### 3. `questions` (Collection)
Questions du questionnaire (gérées par les profs)

**Document ID:** Auto-généré ou `question_{id}`

**Structure:**
```json
{
  "id": number,
  "texte": "string",
  "specialites": ["string"],
  "poids": 1 | 2 | 3,
  "categorie": "sciences" | "humanites" | "economie" | "langues",
  "ordre": number,
  "actif": boolean,
  "createdBy": "string", // userId du prof
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

---

### 4. `stats_globales` (Collection)
Statistiques agrégées pour les profs

**Document ID:** `stats_{period}` (ex: stats_2026_01)

**Structure:**
```json
{
  "period": "string", // "2026-01" format YYYY-MM
  "totalQuestionnaires": number,
  "totalEleves": number,
  "distributionSpecialites": {
    "Maths": number,
    "Physique": number,
    // ... autres spécialités
  },
  "distributionClasses": {
    "seconde": number,
    "premiere": number
  },
  "moyenneTempsQuestionnaire": number, // en secondes
  "updatedAt": timestamp
}
```

---

### 5. `messages_conseillers` (Collection)
Messages envoyés par les élèves aux conseillers

**Document ID:** Auto-généré

**Structure:**
```json
{
  "userId": "string",
  "userEmail": "string",
  "userName": "string",
  "message": "string",
  "topSpecialites": ["string"],
  "status": "nouveau" | "lu" | "repondu",
  "reponse": "string" | null,
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

---

### 6. `notifications` (Collection)
Notifications pour les élèves

**Document ID:** Auto-généré

**Structure:**
```json
{
  "userId": "string",
  "type": "nouveau_contenu" | "rappel" | "conseil",
  "titre": "string",
  "message": "string",
  "lu": boolean,
  "createdAt": timestamp
}
```

---

## Indexes Recommandés

### resultats_questionnaires
- Composite: `userId` (Ascending) + `date` (Descending)
- Composite: `classe` (Ascending) + `date` (Descending)

### questions
- Single: `actif` (Ascending)
- Single: `ordre` (Ascending)

### notifications
- Composite: `userId` (Ascending) + `lu` (Ascending) + `createdAt` (Descending)

### messages_conseillers
- Composite: `status` (Ascending) + `createdAt` (Descending)
- Single: `userId` (Ascending)

---

## Règles de Sécurité Firestore (à implémenter)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Résultats questionnaires
    match /resultats_questionnaires/{resultId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'prof');
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Questions (lecture pour tous, écriture pour profs uniquement)
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'prof';
    }
    
    // Stats globales (lecture pour profs uniquement)
    match /stats_globales/{statId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'prof';
      allow write: if false; // Uniquement via Cloud Functions
    }
    
    // Messages conseillers
    match /messages_conseillers/{messageId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'prof');
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'prof';
    }
    
    // Notifications
    match /notifications/{notifId} {
      allow read, update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'prof';
    }
  }
}
```
