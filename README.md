<<<<<<< HEAD
# 🏢 Suite RH & Recrutement ATS (Gestion-RH)

[![Java](https://img.shields.io/badge/Java-17-orange.svg?style=for-the-badge&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1.svg?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

> **Solution Fullstack Enterprise de Gestion des Ressources Humaines & Système d'Acheminement des Candidatures (ATS).**  
> Allie un **Backoffice RH (style ERP Dolibarr)** puissant et un **Frontoffice Candidat** ergonomique pour automatiser l'intégralité du cycle de recrutement, des évaluations QCM, de la gestion des congés et de la génération automatisée des contrats de travail.

---

## 📌 Sommaire

- [✨ Fonctionnalités Clés](#-fonctionnalités-clés)
- [🏗️ Architecture du Système](#️-architecture-du-système)
- [🛠️ Stack Technique](#️-stack-technique)
- [🚀 Guide d'Installation](#-guide-dinstallation)
  - [Prérequis](#1-prérequis)
  - [Base de Données](#2-base-de-données-postgresql)
  - [Backend (Spring Boot)](#3-backend-spring-boot)
  - [Frontend (React + Vite)](#4-frontend-react--vite)
- [📄 Documentation des API (Swagger)](#-documentation-des-api-swagger)
- [📂 Structure du Projet](#-structure-du-projet)
- [🤝 Contribution & Licence](#-contribution--licence)

---

## ✨ Fonctionnalités Clés

### 🎯 1. Module Recrutement & ATS (Applicant Tracking System)
* **Portail Candidat Public (Frontoffice)** : Consultation fluide des offres d'emploi, dépôts de candidatures avec téléversement de CV et questionnaires dynamiques d'exigences.
* **Tableau de Bord Kanban RH** : Suivi visuel des étapes de recrutement (*Nouveau, Sélectionné, En Test, En Entretien, Retenu, Rejeté*).
* **Filtrage Multicritère Dynamique** : Moteur de scoring automatique pondérant les diplômes, l'expérience, le salaire exigé et la localisation.
* **Évaluations & Tests QCM** : Création d'épreuves personnalisées avec calcul automatique de la note et des seuils d'admissibilité.
* **Gestion des Entretiens** : Planification avancée des rendez-vous, attribution des évaluateurs et grilles de notation synthétiques.

### 💼 2. Module Gestion RH & Administration Personnel
* **Gestion des Congés & Absences** : Demandes en ligne, calcul et mise à jour en temps réel des soldes de congés, circuit d'approbation et export PDF officiel.
* **Génération Automatisée de Contrats** : Édition instantanée des contrats de travail (PDF via OpenPDF) personnalisés selon les données candidat/poste.
* **Référentiels Métiers & Formations** : Gestion centralisée des diplômes, départements, critères requis et postes ouverts.
* **Design ERP Dolibarr** : Interface d'administration optimisée pour la productivité avec des grilles de données épurées, filtres instantanés et statut pilules tricolores.

---

## 🏗️ Architecture du Système

```mermaid
graph TD
    subgraph Client Layer
        A[Frontoffice Candidat - React 19]
        B[Backoffice RH Dolibarr Theme - React 19]
    end

    subgraph API Layer / Gateway
        C[REST API Controllers - Spring Boot 3]
        D[Spring Security & JWT Auth]
    end

    subgraph Service & Core Logic
        E[ATS & Screening Engine]
        F[QCM Evaluator Service]
        G[Contrat & Congé PDF Generator - OpenPDF]
    end

    subgraph Persistence Layer
        H[(PostgreSQL Database)]
    end

    A -->|HTTP / JSON| C
    B -->|HTTP / JSON| C
    C --> D
    D --> E
    D --> F
    D --> G
    E --> H
    F --> H
    G --> H
```

---

## 🛠️ Stack Technique

### **Frontend**
* **Framework** : React 19 & Vite 8
* **Routing** : React Router DOM v7
* **HTTP Client** : Axios
* **Utilitaires** : JSZip, PapaParse
* **Design System** : Vanilla CSS 3 (Thème ERP Dolibarr personnalisable, Responsive & Dark-friendly components)

### **Backend**
* **Langage & Framework** : Java 17 & Spring Boot 3
* **Persistance** : Spring Data JPA / Hibernate
* **Sécurité** : Spring Security (RBAC / Auth)
* **Génération PDF** : OpenPDF (LibrePDF)
* **Documentation API** : SpringDoc OpenAPI 2.5 (Swagger UI)
* **Boilerplate** : Lombok

### **Base de Données**
* **SGBD** : PostgreSQL 15+

---

## 🚀 Guide d'Installation

### 1. Prérequis
Assurez-vous de disposer des éléments suivants installés sur votre machine :
* **Java SDK 17+** (`java -version`)
* **Node.js 18+** & **npm 9+** (`node -v`, `npm -v`)
* **PostgreSQL 15+** (`psql --version`)
* **Maven 3.8+** (ou wrapper `mvnw` inclus)

---

### 2. Base de Données PostgreSQL

1. Créez la base de données PostgreSQL :
   ```sql
   CREATE DATABASE gestion_rh;
   ```
2. Exécutez les scripts SQL d'initialisation situés dans le dossier `database/` dans l'ordre chronologique :
   ```bash
   psql -U postgres -d gestion_rh -f database/01-table.sql
   psql -U postgres -d gestion_rh -f database/02-data.sql
   ```

---

### 3. Backend (Spring Boot)

1. Naviguez dans le sous-dossier `backend` :
   ```bash
   cd backend
   ```
2. Configurez l'accès à votre base PostgreSQL dans `src/main/resources/application.properties` (hôte, utilisateur, mot de passe).
3. Lancez le serveur Spring Boot :
   ```bash
   ./mvnw spring-boot:run
   ```
   *Le serveur démarrera sur `http://localhost:8080`*

---

### 4. Frontend (React + Vite)

1. Naviguez dans le sous-dossier `frontend` :
   ```bash
   cd frontend
   ```
2. Installez les dépendances npm :
   ```bash
   npm install
   ```
3. Démarrez le serveur de développement :
   ```bash
   npm run dev
   ```
   *L'application sera accessible sur `http://localhost:5173`*

---

## 📄 Documentation des API (Swagger)

Une fois le backend démarré, la documentation interactive Swagger / OpenAPI est accessible à l'adresse suivante :
👉 **`http://localhost:8080/swagger-ui.html`**

Elle permet de tester directement les différents endpoints REST (offres, candidatures, congés, épreuves QCM, contrats).

---

## 📂 Structure du Projet

```text
Gestion-RH/
├── 📁 backend/                # Projet Spring Boot 3 (Java 17)
│   ├── src/main/java/         # Controllers, Services, Repositories, Models
│   └── src/main/resources/    # Configuration application.properties & templates
├── 📁 frontend/               # Projet React 19 + Vite
│   ├── src/pages/backoffice/  # Tableau de bord RH, Annonces, Candidats, QCM, Congés
│   ├── src/pages/frontoffice/ # Espace Candidat Public & Formulaires
│   └── src/styles/            # Theme Dolibarr CSS
├── 📁 database/               # Scripts SQL d'initialisation & schémas
└── 📁 documentation/          # Documentation détaillée page par page (.md)
```

---

## 🤝 Contribution & Licence

Les contributions sont les bienvenues ! Pour toute modification majeure, merci d'ouvrir une issue au préalable pour discuter de ce que vous souhaitez modifier.

Distribué sous la licence **MIT**.

=======
# 🏢 Suite ERP RH & Recrutement ATS (Gestion-RH)

[![Java](https://img.shields.io/badge/Java-17-orange.svg?style=for-the-badge&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4+-brightgreen.svg?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1.svg?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

> **Solution Fullstack Enterprise de Gestion des Ressources Humaines, Paie & Système ATS (Applicant Tracking System).**  
> Allie un **Backoffice RH (thème ERP Dolibarr)** complet et un **Frontoffice Candidat** ergonomique pour automatiser l'intégralité du cycle de recrutement, l'évaluation QCM, la gestion des congés, la paie/bulletins de salaire et la génération automatisée des contrats de travail.

---

## 📌 Sommaire

- [✨ Fonctionnalités Clés](#-fonctionnalités-clés)
- [🏗️ Architecture du Système](#️-architecture-du-système)
- [🛠️ Stack Technique](#️-stack-technique)
- [🚀 Guide d'Installation](#-guide-dinstallation)
  - [Prérequis](#1-prérequis)
  - [Base de Données](#2-base-de-données-postgresql)
  - [Backend (Spring Boot)](#3-backend-spring-boot)
  - [Frontend (React + Vite)](#4-frontend-react--vite)
- [📄 Documentation des API (Swagger)](#-documentation-des-api-swagger)
- [📂 Structure du Projet](#-structure-du-projet)
- [🤝 Contribution & Licence](#-contribution--licence)

---

## ✨ Fonctionnalités Clés

### 🎯 1. Module Recrutement & ATS (Applicant Tracking System)
* **Portail Candidat Public (Frontoffice)** : Consultation des offres d'emploi, dépôt de candidature en ligne avec CV et réponse aux formulaires dynamiques de critères.
* **Tableau de Bord Kanban RH** : Suivi des candidatures par statut (*Nouveau, Sélectionné, En Test, En Entretien, Retenu, Rejeté*).
* **Moteur de Screening Multicritères** : Calcul automatique de scores basé sur le diplôme, l'expérience, le salaire exigé et les exigences du poste.
* **Évaluations & Tests QCM** : Création d'épreuves personnalisées avec calcul automatique des notes et d'admissibilité.
* **Planning d'Entretiens** : Organisation des rendez-vous, attribution des évaluateurs et grilles d'évaluation.

### 🌴 2. Module Gestion des Congés & Absences
* **Demandes & Validation** : Circuit d'approbation des demandes de congés avec historique détaillé.
* **Gestion des Soldes** : Suivi et mise à jour en temps réel des soldes de congés payés par employé.
* **Jours Fériés & Calendrier** : Prise en compte des jours fériés et calcul précis des jours ouvrés.
* **Génération PDF** : Exportation des pièces justificatives et formulaires de congé en PDF (OpenPDF).

### 💰 3. Module Paie & Administration du Personnel
* **Bulletins de Paie** : Calcul de la paie, gestion des lignes de bulletin et des cotisations.
* **Feuilles de Temps (Time tracking)** : Suivi du temps de travail et heures effectuées.
* **Génération de Contrats** : Édition instantanée des contrats de travail (PDF) personnalisés selon les informations candidat/employé.
* **Gestion des Employés & Département** : Annuaire des employés, gestion des rôles, profils et diplômes.

---

## 🏗️ Architecture du Système

```mermaid
graph TD
    subgraph Client Layer
        A[Frontoffice Candidat - React 19]
        B[Backoffice RH Dolibarr Theme - React 19]
    end

    subgraph API Layer / Gateway
        C[REST API Controllers - Spring Boot 3 / Port 8081]
        D[Spring Security & Auth]
    end

    subgraph Service & Core Modules
        E[ATS & Screening Engine]
        F[QCM Evaluator Service]
        G[Gestion Congés Service]
        H[Gestion Paie & Contrats Service - OpenPDF]
    end

    subgraph Persistence Layer
        I[(PostgreSQL Database: gestion_rh)]
    end

    A -->|HTTP / REST API| C
    B -->|HTTP / REST API| C
    C --> D
    D --> E
    D --> F
    D --> G
    D --> H
    E --> I
    F --> I
    G --> I
    H --> I
```

---

## 🛠️ Stack Technique

### **Frontend**
* **Framework** : React 19 & Vite 8
* **Routing** : React Router DOM v7
* **Client HTTP** : Axios
* **Utilitaires** : JSZip, PapaParse
* **UI/UX Design System** : Vanilla CSS (Inspiré du thème ERP Dolibarr, responsive, composants épurés)

### **Backend**
* **Langage & Framework** : Java 17 & Spring Boot 3
* **Persistance** : Spring Data JPA / Hibernate
* **Sécurité** : Spring Security
* **Génération PDF** : OpenPDF (LibrePDF)
* **Documentation API** : SpringDoc OpenAPI 2.5 (Swagger UI)
* **Boilerplate** : Lombok

### **Base de Données**
* **SGBD** : PostgreSQL 15+ (`gestion_rh`)

---

## 🚀 Guide d'Installation

### 1. Prérequis
Assurez-vous de disposer de :
* **Java SDK 17+** (`java -version`)
* **Node.js 18+** & **npm 9+** (`node -v`, `npm -v`)
* **PostgreSQL 15+** (`psql --version`)

---

### 2. Base de Données PostgreSQL

1. Créez la base de données dans PostgreSQL :
   ```sql
   CREATE DATABASE gestion_rh;
   ```
2. Exécutez les scripts SQL d'initialisation situés dans `database/` :
   ```bash
   psql -U postgres -d gestion_rh -f database/22-07-Recrutement.sql
   psql -U postgres -d gestion_rh -f database/22-07-DonneeRecrutement.sql
   psql -U postgres -d gestion_rh -f database/22-07-DonneeTestRecrutement.sql
   psql -U postgres -d gestion_rh -f database/04-08-Conge.sql
   psql -U postgres -d gestion_rh -f database/04-08-DonneeConge.sql
   psql -U postgres -d gestion_rh -f database/09-08-Paie.sql
   psql -U postgres -d gestion_rh -f database/09-08-DonneePaie.sql
   ```

---

### 3. Backend (Spring Boot)

1. Rendez-vous dans le dossier `backend` :
   ```bash
   cd backend
   ```
2. Vérifiez la configuration de la base dans `src/main/resources/application.properties` :
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/gestion_rh
   spring.datasource.username=postgres
   spring.datasource.password=votre_mot_de_passe
   server.port=8081
   ```
3. Démarrez le backend :
   ```bash
   ./mvnw spring-boot:run
   ```
   *Le serveur s'exécute sur `http://localhost:8081`*

---

### 4. Frontend (React + Vite)

1. Rendez-vous dans le dossier `frontend` :
   ```bash
   cd frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Démarrez le serveur Web :
   ```bash
   npm run dev
   ```
   *L'application est accessible sur `http://localhost:5173`*

---

## 📄 Documentation des API (Swagger)

L'API Spring Boot intègre la documentation interactive Swagger UI. Une fois le backend lancé sur le port 8081, accédez à :  
👉 **`http://localhost:8081/swagger-ui.html`**

---

## 📂 Structure du Projet

```text
Gestion-RH/
├── 📁 backend/                # API REST Spring Boot 3 (Port 8081)
│   ├── src/main/java/         # Controllers, Services, Repositories, Entities (ATS, Congés, Paie)
│   └── src/main/resources/    # Configuration application.properties & uploads
├── 📁 frontend/               # Application Web React 19 + Vite
│   ├── src/pages/backoffice/  # Dashboard RH, Annonces, Candidats, QCM, Congés, Paie
│   ├── src/pages/frontoffice/ # Espace Public Candidats
│   └── src/styles/            # Thème Dolibarr CSS
├── 📁 database/               # Scripts SQL (Recrutement, Congés, Paie)
└── 📁 documentation/          # Documentation détaillée par page (.md)
```

---

## 🤝 Contribution & Licence

Les contributions sont les bienvenues ! Pour toute amélioration, veuillez ouvrir une issue ou une Pull Request.

Distribué sous la licence **MIT**. Voir [LICENSE](LICENSE) pour plus d'informations.

---

<p align="center">
  Fait avec ❤️ par <b>Mikajy</b> — Développeur Fullstack
</p>
>>>>>>> 3e56572e8791b60ee40796f314be14dae6e706bf
