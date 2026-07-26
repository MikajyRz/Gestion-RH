-- ============================================================================
-- BASE DE DONNÉES : MODULE 1 (RECRUTEMENT & INTÉGRATION)
-- ============================================================================

DROP TABLE IF EXISTS historiqueentretien, entretien, resultat, statutentretien, 
                     historiquecandidature, candidaturecritere, qcmreponse, qcmchoix, 
                     qcmquestion, testannonce, qcmqtest, qcmtest, candidat, 
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
    motdepasse VARCHAR(255) NOT NULL
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
    datedebut DATE,
    datefin DATE,
    nomposte VARCHAR(100) NOT NULL,
    iddepartement INT REFERENCES departement(id) ON DELETE SET NULL,
    idprofil INT REFERENCES profil(id) ON DELETE SET NULL,
    idtypeannonce INT REFERENCES typeannonce(id) ON DELETE SET NULL,
    datepublication DATE DEFAULT CURRENT_DATE
);

CREATE TABLE critere (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    idtypechamp INT REFERENCES typechamp(id) ON DELETE CASCADE
);

CREATE TABLE critereprofil (
    id SERIAL PRIMARY KEY,
    idprofil INT REFERENCES profil(id) ON DELETE CASCADE,
    idcritere INT REFERENCES critere(id) ON DELETE CASCADE,
    valeurdouble NUMERIC(10,2),
    valeurvarchar VARCHAR(200),
    valeurbool BOOLEAN,
    estobligatoire BOOLEAN DEFAULT TRUE
);

CREATE TABLE profildiplome (
    id SERIAL PRIMARY KEY,
    idprofil INT NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
    iddiplome INT NOT NULL REFERENCES diplome(id) ON DELETE CASCADE,
    CONSTRAINT uk_profil_diplome UNIQUE (idprofil, iddiplome)
);

-- 3. CANDIDATS & CANDIDATURES
CREATE TABLE candidat (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    datenaissance DATE,
    adresse VARCHAR(200),
    cv TEXT, -- Chemin du fichier stocké (PDF)
    idannonce INT REFERENCES annonce(id) ON DELETE SET NULL,
    idstatut INT REFERENCES statutcandidat(id) ON DELETE SET NULL,
    idcomptecandidat INT REFERENCES comptecandidat(id) ON DELETE CASCADE
);

CREATE TABLE candidaturecritere (
    id SERIAL PRIMARY KEY,
    idcandidat INT REFERENCES candidat(id) ON DELETE CASCADE,
    idannonce INT REFERENCES annonce(id) ON DELETE CASCADE,
    idcritere INT REFERENCES critere(id) ON DELETE CASCADE,
    valeurdouble NUMERIC(10,2),
    valeurvarchar VARCHAR(200),
    valeurbool BOOLEAN,
    iddiplome INT REFERENCES diplome(id) ON DELETE SET NULL
);

CREATE TABLE historiquecandidature (
    id SERIAL PRIMARY KEY,
    idcandidat INT REFERENCES candidat(id) ON DELETE CASCADE,
    idstatut INT REFERENCES statutcandidat(id) ON DELETE CASCADE,
    datechangement TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ENTRETIENS
CREATE TABLE entretien (
    id SERIAL PRIMARY KEY,
    idcandidat INT REFERENCES candidat(id) ON DELETE CASCADE,
    dateheure TIMESTAMP NOT NULL,
    idstatut INT REFERENCES statutentretien(id) ON DELETE SET NULL,
    idresultat INT REFERENCES resultat(id) ON DELETE SET NULL
);

CREATE TABLE historiqueentretien (
    id SERIAL PRIMARY KEY,
    identretien INT REFERENCES entretien(id) ON DELETE CASCADE,
    idstatut INT REFERENCES statutentretien(id) ON DELETE CASCADE,
    datechangement TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. QCM ET TESTS TECHNIQUES
CREATE TABLE qcmtest (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    idprofil INT REFERENCES profil(id) ON DELETE SET NULL
);

CREATE TABLE qcmquestion (
    id SERIAL PRIMARY KEY,
    idtest INT NOT NULL REFERENCES qcmtest(id) ON DELETE CASCADE,
    numero INT NOT NULL,
    question TEXT NOT NULL,
    points INT NOT NULL DEFAULT 1
);

CREATE TABLE qcmchoix (
    id SERIAL PRIMARY KEY,
    idquestion INT NOT NULL REFERENCES qcmquestion(id) ON DELETE CASCADE,
    texte VARCHAR(500) NOT NULL,
    estcorrect BOOLEAN DEFAULT FALSE
);

CREATE TABLE qcmreponse (
    id SERIAL PRIMARY KEY,
    idcandidat INT NOT NULL REFERENCES candidat(id) ON DELETE CASCADE,
    idtest INT NOT NULL REFERENCES qcmtest(id) ON DELETE CASCADE,
    idquestion INT NOT NULL REFERENCES qcmquestion(id) ON DELETE CASCADE,
    idchoix INT REFERENCES qcmchoix(id) ON DELETE SET NULL,
    pointsobtenus INT DEFAULT 0,
    datereponse TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE testannonce (
    id SERIAL PRIMARY KEY,
    idtest INT NOT NULL REFERENCES qcmtest(id) ON DELETE CASCADE,
    idannonce INT NOT NULL REFERENCES annonce(id) ON DELETE CASCADE
);

-- 6. UTILISATEURS RH ET CONTRATS
CREATE TABLE types_contrat (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- Utilisé par le backend Spring Boot (ex: 'CDI')
    libelle VARCHAR(100) NOT NULL     -- Libellé affiché sur l'application React
);

CREATE TABLE contrat (
    id SERIAL PRIMARY KEY,
    idemploye INT REFERENCES employe(id) ON DELETE CASCADE,
    datedebut DATE NOT NULL,
    nombremois INT,
    typecontrat INT REFERENCES types_contrat(id) ON DELETE SET NULL
);

CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    motdepasse VARCHAR(200) NOT NULL,
    idemploye INT REFERENCES employe(id) ON DELETE CASCADE
);

-- 7. INDEXATION PERFORMANCES (POUR APIS REACT)
CREATE INDEX idx_candidat_annonce ON candidat(idannonce);
CREATE INDEX idx_candidat_statut ON candidat(idstatut);
CREATE INDEX idx_entretien_candidat ON entretien(idcandidat);
CREATE INDEX idx_qcmreponse_candidat ON qcmreponse(idcandidat, idtest);