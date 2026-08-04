-- ============================================================================
-- BASE DE DONNÉES : MODULE 2 (GESTION DES CONGÉS ET ABSENCES)
-- ============================================================================

DROP TABLE IF EXISTS historique_demande_conge, demande_conge, solde_conge, droit_conge, statut_demande_conge, type_conge, jour_ferie CASCADE;

-- 1. TYPES DE CONGÉS
CREATE TABLE type_conge (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL UNIQUE,
    est_remunere BOOLEAN DEFAULT TRUE,
    description TEXT
);

-- 2. STATUTS DES DEMANDES DE CONGÉS
CREATE TABLE statut_demande_conge (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- EN_ATTENTE, APPROUVE, REFUSE, ANNULE
    libelle VARCHAR(100) NOT NULL     -- En attente, Approuvé par RH, Refusé par RH, Annulé
);

-- 3. DROITS DE CONGÉS PAR CATEGORIE & ANCIENNETÉ
CREATE TABLE droit_conge (
    id SERIAL PRIMARY KEY,
    id_categorie INT REFERENCES categoriepersonnel(id),
    id_type_conge INT REFERENCES type_conge(id) ON DELETE CASCADE,
    jours_par_annee NUMERIC(5,2) NOT NULL,
    jours_par_anciennete NUMERIC(5,2) DEFAULT 0,
    annees_anciennete INT DEFAULT 0,
    duree_validite INT DEFAULT 3,
    CONSTRAINT uk_categorie_typeconge UNIQUE (id_categorie, id_type_conge)
);

-- 4. SOLDES DE CONGÉS PAR EMPLOYÉ
CREATE TABLE solde_conge (
    id SERIAL PRIMARY KEY,
    id_employe INT NOT NULL REFERENCES employe(id) ON DELETE CASCADE,
    id_type_conge INT NOT NULL REFERENCES type_conge(id) ON DELETE CASCADE,
    annee INT NOT NULL,
    jours_acquis NUMERIC(6,2) DEFAULT 0,
    jours_pris NUMERIC(6,2) DEFAULT 0,
    jours_restants NUMERIC(6,2) DEFAULT 0,
    date_calcul TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_employe_typeconge_annee UNIQUE (id_employe, id_type_conge, annee)
);

-- 5. CALENDRIER DES JOURS FÉRIÉS
CREATE TABLE jour_ferie (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL,
    date_ferie DATE UNIQUE NOT NULL
);

-- 6. DEMANDES DE CONGÉS (VALIDATION SIMPLE PAR RH)
CREATE TABLE demande_conge (
    id SERIAL PRIMARY KEY,
    id_employe INT NOT NULL REFERENCES employe(id) ON DELETE CASCADE,
    id_type_conge INT NOT NULL REFERENCES type_conge(id),
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    nombre_jours INT NOT NULL,
    motif TEXT,
    id_statut INT REFERENCES statut_demande_conge(id) DEFAULT 1,
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_validateur_rh INT REFERENCES employe(id), -- Le responsable RH qui valide ou refuse
    commentaire_refus TEXT
);

-- 7. HISTORIQUE DES CHANGEMENTS DE STATUT
CREATE TABLE historique_demande_conge (
    id SERIAL PRIMARY KEY,
    id_demande_conge INT NOT NULL REFERENCES demande_conge(id) ON DELETE CASCADE,
    id_statut INT NOT NULL REFERENCES statut_demande_conge(id),
    date_changement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    commentaire TEXT
);