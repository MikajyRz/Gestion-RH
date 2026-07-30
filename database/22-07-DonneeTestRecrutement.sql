-- ============================================================================
-- JEU DE DONNÉES DE TEST (DEMO DATA)
-- ============================================================================

-- 1. ANNONCES D'EMPLOI
INSERT INTO annonce (nomposte, description, datedebut, datefin, datepublication, iddepartement, idprofil, idtypeannonce) VALUES
(
  'Développeur Fullstack Java / React Senior',
  'Nous recherchons un développeur Fullstack expérimenté maîtrisant Spring Boot et React.js pour concevoir des applications web complexes.',
  '2026-08-01', '2026-09-15', '2026-07-20',
  (SELECT id FROM departement WHERE nom = 'Informatique & R&D'),
  (SELECT id FROM profil WHERE nom = 'Développeur Fullstack Java / React'),
  (SELECT id FROM typeannonce WHERE libelle = 'Recrutement Externe')
),
(
  'Gardien / Agent de Sécurité de Nuit',
  'Poste de surveillance physique des locaux et contrôle des accès. Travail en horaires décalés (nuit et week-end).',
  '2026-08-15', '2026-10-01', '2026-07-18',
  (SELECT id FROM departement WHERE nom = 'Sécurité & Logistique'),
  (SELECT id FROM profil WHERE nom = 'Gardien / Agent de Sécurité'),
  (SELECT id FROM typeannonce WHERE libelle = 'Recrutement Externe')
),
(
  'Comptable Senior - Gestion de Trésorerie',
  'Prise en charge du bilan annuel, suivi de la trésorerie et déclarations fiscales. Expérience exigée en cabinet ou entreprise.',
  '2026-09-01', '2026-10-15', '2026-07-15',
  (SELECT id FROM departement WHERE nom = 'Finance & Comptabilité'),
  (SELECT id FROM profil WHERE nom = 'Comptable Senior'),
  (SELECT id FROM typeannonce WHERE libelle = 'Recrutement Externe')
);

-- 2. COMPTES & CANDIDATS
INSERT INTO comptecandidat (email, motdepasse) VALUES
('jean.dupont@gmail.com', '$2a$10$e8T3bB...hash_mot_de_passe_demo'),
('rasoa.gardien@gmail.com', '$2a$10$e8T3bB...hash_mot_de_passe_demo');

INSERT INTO candidat (nom, prenom, datenaissance, adresse, cv, idannonce, idstatut, idcomptecandidat) VALUES
(
  'Dupont', 'Jean', '1998-05-14', 'Lot II B 123 Antananarivo',
  '/uploads/cv/jean_dupont_cv.pdf',
  (SELECT id FROM annonce WHERE nomposte LIKE 'Développeur Fullstack%'),
  (SELECT id FROM statutcandidat WHERE nom = 'QCM Envoyé'),
  (SELECT id FROM comptecandidat WHERE email = 'jean.dupont@gmail.com')
),
(
  'Rasoanaivo', 'Paul', '1992-11-03', 'Lot IV G 45 Ivato',
  '/uploads/cv/paul_rasoanaivo_cv.pdf',
  (SELECT id FROM annonce WHERE nomposte LIKE 'Gardien%'),
  (SELECT id FROM statutcandidat WHERE nom = 'Présélectionné'),
  (SELECT id FROM comptecandidat WHERE email = 'rasoa.gardien@gmail.com')
);

-- 3. RÉPONSES AUX CRITÈRES
INSERT INTO candidaturecritere (idcandidat, idannonce, idcritere, valeurdouble) VALUES
(
  (SELECT id FROM candidat WHERE nom = 'Dupont'),
  (SELECT id FROM annonce WHERE nomposte LIKE 'Développeur Fullstack%'),
  (SELECT id FROM critere WHERE nom = 'Années d''expérience globale'),
  4.0
);

INSERT INTO candidaturecritere (idcandidat, idannonce, idcritere, valeurdouble, valeurbool) VALUES
(
  (SELECT id FROM candidat WHERE nom = 'Rasoanaivo'),
  (SELECT id FROM annonce WHERE nomposte LIKE 'Gardien%'),
  (SELECT id FROM critere WHERE nom = 'Taille minimale (cm)'),
  182.0, NULL
),
(
  (SELECT id FROM candidat WHERE nom = 'Rasoanaivo'),
  (SELECT id FROM annonce WHERE nomposte LIKE 'Gardien%'),
  (SELECT id FROM critere WHERE nom = 'Casier judiciaire vierge'),
  NULL, TRUE
);

-- 4. TEST QCM & QUESTIONS
INSERT INTO qcmtest (nom, idprofil) VALUES
(
  'QCM - Évaluation Java & Spring Boot',
  (SELECT id FROM profil WHERE nom = 'Développeur Fullstack Java / React')
);

INSERT INTO qcmquestion (idtest, numero, question, points) VALUES
(
  (SELECT id FROM qcmtest WHERE nom LIKE 'QCM - Évaluation Java%'),
  1,
  'Quelle annotation Spring Boot permet de définir un contrôleur REST ?',
  2
);

INSERT INTO qcmchoix (idquestion, texte, estcorrect) VALUES
((SELECT id FROM qcmquestion WHERE numero = 1), '@Controller', FALSE),
((SELECT id FROM qcmquestion WHERE numero = 1), '@RestController', TRUE),
((SELECT id FROM qcmquestion WHERE numero = 1), '@Service', FALSE);

INSERT INTO qcmquestion (idtest, numero, question, points) VALUES
(
  (SELECT id FROM qcmtest WHERE nom LIKE 'QCM - Évaluation Java%'),
  2,
  'Quel hook React est utilisé pour effectuer des effets secondaires (ex: requêtes API) ?',
  2
);

INSERT INTO qcmchoix (idquestion, texte, estcorrect) VALUES
((SELECT id FROM qcmquestion WHERE numero = 2), 'useState', FALSE),
((SELECT id FROM qcmquestion WHERE numero = 2), 'useContext', FALSE),
((SELECT id FROM qcmquestion WHERE numero = 2), 'useEffect', TRUE);

INSERT INTO testannonce (idtest, idannonce) VALUES
(
  (SELECT id FROM qcmtest WHERE nom LIKE 'QCM - Évaluation Java%'),
  (SELECT id FROM annonce WHERE nomposte LIKE 'Développeur Fullstack%')
);

-- 5. HISTORIQUE & ENTRETIEN
INSERT INTO historiquecandidature (idcandidat, idstatut) VALUES
(
  (SELECT id FROM candidat WHERE nom = 'Dupont'),
  (SELECT id FROM statutcandidat WHERE nom = 'En attente')
),
(
  (SELECT id FROM candidat WHERE nom = 'Dupont'),
  (SELECT id FROM statutcandidat WHERE nom = 'QCM Envoyé')
);

INSERT INTO resultat (note, appreciation) VALUES
(17, 'Excellent candidat technique, très bonne maîtrise de Spring Boot et React.');

INSERT INTO entretien (idcandidat, dateheure, idstatut, idresultat) VALUES
(
  (SELECT id FROM candidat WHERE nom = 'Dupont'),
  '2026-07-25 10:00:00',
  (SELECT id FROM statutentretien WHERE nom = 'Terminé'),
  (SELECT id FROM resultat WHERE note = 17)
);

-- 6. UTILISATEURS BACKOFFICE RH
INSERT INTO employe (nom, prenom, email) VALUES
('Responsable', 'RH', 'admin@gestionrh.com');

INSERT INTO utilisateurs (email, motdepasse, idemploye) VALUES
('admin@gestionrh.com', 'admin123', (SELECT id FROM employe WHERE email = 'admin@gestionrh.com'));