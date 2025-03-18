# Plateforme Intelligente d’Évaluation Automatisée des Exercices de Bases de Données

Une plateforme web développée dans le cadre du cours de **SGBD Avancé** (Master 1, Semestre 1) pour permettre aux professeurs de créer des exercices de bases de données et aux étudiants de soumettre leurs réponses, avec une évaluation automatisée des requêtes SQL grâce à l’intelligence artificielle.

## Fonctionnalités
- **Pour les professeurs** :
  - Création et gestion d’exercices avec description et requête SQL attendue.
  - Tableau de bord pour corriger manuellement les soumissions.
  - Statistiques sur les performances par exercice (note moyenne, taux de réussite) avec graphiques.
- **Pour les étudiants** :
  - Soumission de réponses (texte SQL ou fichiers).
  - Historique des soumissions avec notes et feedback.
  - Statistiques personnelles (note moyenne, progression) avec graphiques.
- **Évaluation automatique** :
  - Validation syntaxique des requêtes SQL.
  - Comparaison avec la réponse attendue et exécution simulée.
  - Analyse par IA (Ollama/DeepSeek) pour les réponses textuelles.

## Technologies utilisées
- **Backend** : Django, Django REST Framework, MySQL
- **Frontend** : React, Tailwind CSS, Chart.js
- **IA et SQL** : Ollama (DeepSeek), validation SQL personnalisée
- **Tests** : Tests unitaires avec Django Test Framework

## Prérequis
- Python 3.9+
- Node.js 16+
- MySQL
- Git
- (Optionnel) Ollama installé localement pour l’évaluation IA

## Installation

### 1. Cloner le dépôt
```bash
git clone https://github.com/votre-utilisateur/plateforme_db.git
cd plateforme_db