-- ============================================================================
-- BASE DE DONNÉES : MODULE 1 (RECRUTEMENT & INTÉGRATION)
-- ============================================================================

DROP TABLE IF EXISTS historiqueentretien, entretien, resultat, statutentretien, 
                     historiquecandidature, candidaturecritere, qcmreponse, qcmchoix, 
                     qcmquestion, testannonce, qcmqtest, qcmtest, offre_embauche, candidat, 
                     comptecandidat, statutcandidat, profildiplome, critereprofil, 
                     critere, typechamp, annonce, typeannonce, diplome, 
                     utilisateurs, contrat, types_contrat, employe, profil, departement CASCADE;

-- 1. TABLES DE RÉFÉRENCE ET STRUCTURE SANS DÉPENDANCES
CREATE TABLE departement (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL
);

CREATE TABLE profil (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL
);

CREATE TABLE typeannonce (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE typechamp (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE diplome (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL
);

CREATE TABLE statutcandidat (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL
);

CREATE TABLE statutentretien (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL
);

CREATE TABLE resultat (
    id SERIAL PRIMARY KEY,
    note INT CHECK (note BETWEEN 1 AND 20),
    appreciation VARCHAR(200)
);

CREATE TABLE comptecandidat (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL
);

-- Note : Ajout de la table employe si nécessaire pour clés étrangères
CREATE TABLE employe (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE
);

-- 2. ANNONCES & CRITÈRES
CREATE TABLE annonce (
    id SERIAL PRIMARY KEY,
    description TEXT,
    date_debut DATE,
    date_fin DATE,
    nom_poste VARCHAR(100) NOT NULL,
    id_departement INT REFERENCES departement(id) ON DELETE SET NULL,
    id_profil INT REFERENCES profil(id) ON DELETE SET NULL,
    id_type_annonce INT REFERENCES typeannonce(id) ON DELETE SET NULL,
    date_publication DATE DEFAULT CURRENT_DATE
);

CREATE TABLE critere (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    id_type_champ INT REFERENCES typechamp(id) ON DELETE CASCADE
);

CREATE TABLE critereprofil (
    id SERIAL PRIMARY KEY,
    id_profil INT REFERENCES profil(id) ON DELETE CASCADE,
    id_critere INT REFERENCES critere(id) ON DELETE CASCADE,
    valeur_double NUMERIC(10,2),
    valeur_varchar VARCHAR(200),
    valeur_bool BOOLEAN,
    est_obligatoire BOOLEAN DEFAULT TRUE
);

CREATE TABLE profildiplome (
    id SERIAL PRIMARY KEY,
    id_profil INT NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
    id_diplome INT NOT NULL REFERENCES diplome(id) ON DELETE CASCADE,
    CONSTRAINT uk_profil_diplome UNIQUE (id_profil, id_diplome)
);

-- 3. CANDIDATS & CANDIDATURES
CREATE TABLE candidat (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE,
    adresse VARCHAR(200),
    cv TEXT, -- Chemin du fichier stocké (PDF)
    id_annonce INT REFERENCES annonce(id) ON DELETE SET NULL,
    id_statut INT REFERENCES statutcandidat(id) ON DELETE SET NULL,
    id_compte_candidat INT REFERENCES comptecandidat(id) ON DELETE CASCADE
);

CREATE TABLE candidaturecritere (
    id SERIAL PRIMARY KEY,
    id_candidat INT REFERENCES candidat(id) ON DELETE CASCADE,
    id_annonce INT REFERENCES annonce(id) ON DELETE CASCADE,
    id_critere INT REFERENCES critere(id) ON DELETE CASCADE,
    valeur_double NUMERIC(10,2),
    valeur_varchar VARCHAR(200),
    valeur_bool BOOLEAN,
    id_diplome INT REFERENCES diplome(id) ON DELETE SET NULL
);

CREATE TABLE historiquecandidature (
    id SERIAL PRIMARY KEY,
    id_candidat INT REFERENCES candidat(id) ON DELETE CASCADE,
    id_statut INT REFERENCES statutcandidat(id) ON DELETE CASCADE,
    date_changement TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ENTRETIENS
CREATE TABLE entretien (
    id SERIAL PRIMARY KEY,
    id_candidat INT REFERENCES candidat(id) ON DELETE CASCADE,
    date_heure TIMESTAMP NOT NULL,
    id_statut INT REFERENCES statutentretien(id) ON DELETE SET NULL,
    id_resultat INT REFERENCES resultat(id) ON DELETE SET NULL
);

CREATE TABLE historiqueentretien (
    id SERIAL PRIMARY KEY,
    id_entretien INT REFERENCES entretien(id) ON DELETE CASCADE,
    id_statut INT REFERENCES statutentretien(id) ON DELETE CASCADE,
    date_changement TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. QCM ET TESTS TECHNIQUES
CREATE TABLE qcmtest (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    id_profil INT REFERENCES profil(id) ON DELETE SET NULL
);

CREATE TABLE qcmquestion (
    id SERIAL PRIMARY KEY,
    id_test INT NOT NULL REFERENCES qcmtest(id) ON DELETE CASCADE,
    numero INT NOT NULL,
    question TEXT NOT NULL,
    points INT NOT NULL DEFAULT 1
);

CREATE TABLE qcmchoix (
    id SERIAL PRIMARY KEY,
    id_question INT NOT NULL REFERENCES qcmquestion(id) ON DELETE CASCADE,
    texte VARCHAR(500) NOT NULL,
    est_correct BOOLEAN DEFAULT FALSE
);

CREATE TABLE qcmreponse (
    id SERIAL PRIMARY KEY,
    id_candidat INT NOT NULL REFERENCES candidat(id) ON DELETE CASCADE,
    id_test INT NOT NULL REFERENCES qcmtest(id) ON DELETE CASCADE,
    id_question INT NOT NULL REFERENCES qcmquestion(id) ON DELETE CASCADE,
    id_choix INT REFERENCES qcmchoix(id) ON DELETE SET NULL,
    points_obtenus INT DEFAULT 0,
    date_reponse TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE testannonce (
    id SERIAL PRIMARY KEY,
    id_test INT NOT NULL REFERENCES qcmtest(id) ON DELETE CASCADE,
    id_annonce INT NOT NULL REFERENCES annonce(id) ON DELETE CASCADE
);

-- 6. UTILISATEURS RH ET CONTRATS
CREATE TABLE types_contrat (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- Utilisé par le backend Spring Boot (ex: 'CDI')
    libelle VARCHAR(100) NOT NULL     -- Libellé affiché sur l'application React
);

CREATE TABLE contrat (
    id SERIAL PRIMARY KEY,
    id_employe INT REFERENCES employe(id) ON DELETE CASCADE,
    date_debut DATE NOT NULL,
    nombre_mois INT,
    id_type_contrat INT REFERENCES types_contrat(id) ON DELETE SET NULL
);

CREATE TABLE offre_embauche (
    id SERIAL PRIMARY KEY,
    id_candidat INT NOT NULL REFERENCES candidat(id) ON DELETE CASCADE,
    id_type_contrat INT REFERENCES types_contrat(id) ON DELETE SET NULL,
    date_debut DATE,
    nombre_mois INT,
    salaire NUMERIC(12,2),
    remarques TEXT,
    statut VARCHAR(50) DEFAULT 'OFFRE_TRANSMISE',
    date_proposition TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(200) NOT NULL,
    id_employe INT REFERENCES employe(id) ON DELETE CASCADE
);

-- 7. INDEXATION PERFORMANCES (POUR APIS REACT)
CREATE INDEX idx_candidat_annonce ON candidat(id_annonce);
CREATE INDEX idx_candidat_statut ON candidat(id_statut);
CREATE INDEX idx_entretien_candidat ON entretien(id_candidat);
CREATE INDEX idx_qcmreponse_candidat ON qcmreponse(id_candidat, id_test);