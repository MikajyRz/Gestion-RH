-- =============================================================================
-- STRUCTURE PRINCIPALE DE LA BASE PAIE & RÉMUNÉRATION (DDL)
-- Fichier: database/09-08-Paie.sql
-- =============================================================================

-- 1) TABLE DES PARAMÈTRES DE COTISATION (CNaPS & OSTIE)
CREATE TABLE IF NOT EXISTS parametre_cotisation (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL UNIQUE,
    taux NUMERIC(6,2) NOT NULL,
    plafond_salarial NUMERIC(12,2),
    date_effet DATE NOT NULL DEFAULT CURRENT_DATE,
    date_fin DATE
);

-- 2) TABLE DES CATEGORIES PERSONNELLES
CREATE TABLE IF NOT EXISTS categorie_personnel (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- 3) TABLE DES FEUILLES DE TEMPS MENSUELLES (Présences & Heures Sup)
CREATE TABLE IF NOT EXISTS feuille_temps (
    id SERIAL PRIMARY KEY,
    id_employe INT NOT NULL REFERENCES employe(id),
    mois INT NOT NULL,
    annee INT NOT NULL,
    jours_travailles NUMERIC(5,2) DEFAULT 22,
    heures_sup_30 NUMERIC(6,2) DEFAULT 0,
    heures_sup_40 NUMERIC(6,2) DEFAULT 0,
    heures_sup_50 NUMERIC(6,2) DEFAULT 0,
    heures_sup_100 NUMERIC(6,2) DEFAULT 0,
    heures_nuit NUMERIC(6,2) DEFAULT 0,
    jours_absences NUMERIC(5,2) DEFAULT 0,
    retards_minutes INT DEFAULT 0,
    date_cloture TIMESTAMP,
    id_valideur_rh INT REFERENCES employe(id),
    CONSTRAINT uk_feuille_temps_employe_mois_annee UNIQUE (id_employe, mois, annee)
);

-- 4) TABLE DES STATUTS DE BULLETIN DE PAIE
CREATE TABLE IF NOT EXISTS statut_bulletin (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    libelle VARCHAR(100) NOT NULL
);

-- 5) TABLE EN-TÊTE DU BULLETIN DE PAIE
CREATE TABLE IF NOT EXISTS bulletin_paie (
    id SERIAL PRIMARY KEY,
    id_employe INT NOT NULL REFERENCES employe(id),
    mois INT NOT NULL,
    annee INT NOT NULL,
    salaire_base NUMERIC(12,2) NOT NULL,
    taux_journalier NUMERIC(12,2),
    taux_horaire NUMERIC(12,2),
    
    -- Cumul des Gains Bruts
    total_heures_sup NUMERIC(12,2) DEFAULT 0,
    total_primes NUMERIC(12,2) DEFAULT 0,
    deduction_absences NUMERIC(12,2) DEFAULT 0,
    salaire_brut NUMERIC(12,2) NOT NULL,

    -- Cotisations Sociales
    cnaps_salarie NUMERIC(12,2) DEFAULT 0,
    ostie_salarie NUMERIC(12,2) DEFAULT 0,
    total_cotisations NUMERIC(12,2) DEFAULT 0,

    -- Impôts (IRSA)
    salaire_imposable NUMERIC(12,2) DEFAULT 0,
    total_irsa NUMERIC(12,2) DEFAULT 0,

    -- Retenues & Avances
    avance_acompte NUMERIC(12,2) DEFAULT 0,
    total_retenues NUMERIC(12,2) NOT NULL,

    -- Net à Payer
    salaire_net NUMERIC(12,2) NOT NULL,

    -- Statut & Horodatage
    id_statut INT REFERENCES statut_bulletin(id),
    date_emission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_validateur_rh INT REFERENCES employe(id),
    mode_paiement VARCHAR(50) DEFAULT 'Virement/chèque',

    CONSTRAINT uk_bulletin_employe_mois_annee UNIQUE (id_employe, mois, annee)
);

-- 6) TABLE DES LIGNES DU BULLETIN DE PAIE (DÉTAILS VISIBLES SUR LE PDF)
CREATE TABLE IF NOT EXISTS ligne_bulletin_paie (
    id SERIAL PRIMARY KEY,
    id_bulletin_paie INT NOT NULL REFERENCES bulletin_paie(id) ON DELETE CASCADE,
    code_rubrique VARCHAR(50) NOT NULL,
    libelle VARCHAR(150) NOT NULL,
    type_ligne VARCHAR(20) NOT NULL CHECK (type_ligne IN ('GAIN', 'RETENUE')),
    nombre_unite NUMERIC(10,2),
    base_calcul NUMERIC(12,2),
    taux_pourcentage NUMERIC(6,2),
    montant_gain NUMERIC(12,2) DEFAULT 0,
    montant_retenue NUMERIC(12,2) DEFAULT 0
);
