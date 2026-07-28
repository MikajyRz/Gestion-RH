package com.gestion.rh.controller;

import com.gestion.rh.model.*;
import com.gestion.rh.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/qcm")
@CrossOrigin(origins = "*")
public class QcmController {

    private final QcmTestRepository qcmTestRepository;
    private final QcmQuestionRepository qcmQuestionRepository;
    private final QcmChoixRepository qcmChoixRepository;
    private final QcmReponseRepository qcmReponseRepository;
    private final ProfilRepository profilRepository;
    private final CandidatRepository candidatRepository;
    private final TestAnnonceRepository testAnnonceRepository;
    private final StatutCandidatRepository statutCandidatRepository;
    private final HistoriqueCandidatureRepository historiqueCandidatureRepository;

    public QcmController(QcmTestRepository qcmTestRepository,
                         QcmQuestionRepository qcmQuestionRepository,
                         QcmChoixRepository qcmChoixRepository,
                         QcmReponseRepository qcmReponseRepository,
                         ProfilRepository profilRepository,
                         CandidatRepository candidatRepository,
                         TestAnnonceRepository testAnnonceRepository,
                         StatutCandidatRepository statutCandidatRepository,
                         HistoriqueCandidatureRepository historiqueCandidatureRepository) {
        this.qcmTestRepository = qcmTestRepository;
        this.qcmQuestionRepository = qcmQuestionRepository;
        this.qcmChoixRepository = qcmChoixRepository;
        this.qcmReponseRepository = qcmReponseRepository;
        this.profilRepository = profilRepository;
        this.candidatRepository = candidatRepository;
        this.testAnnonceRepository = testAnnonceRepository;
        this.statutCandidatRepository = statutCandidatRepository;
        this.historiqueCandidatureRepository = historiqueCandidatureRepository;
    }

    // --- 1. GESTION DES TESTS QCM ---
    @GetMapping("/tests")
    public ResponseEntity<List<QcmTest>> getAllTests() {
        return ResponseEntity.ok(qcmTestRepository.findAll());
    }

    @PostMapping("/tests")
    public ResponseEntity<QcmTest> createTest(@RequestBody QcmTest test) {
        if (test.getProfil() != null && test.getProfil().getId() != null) {
            profilRepository.findById(test.getProfil().getId())
                    .ifPresent(test::setProfil);
        }
        QcmTest saved = qcmTestRepository.save(test);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/tests/{id}")
    public ResponseEntity<QcmTest> updateTest(@PathVariable Integer id, @RequestBody QcmTest details) {
        return qcmTestRepository.findById(id).map(existing -> {
            existing.setNom(details.getNom());
            if (details.getProfil() != null && details.getProfil().getId() != null) {
                profilRepository.findById(details.getProfil().getId())
                        .ifPresent(existing::setProfil);
            } else {
                existing.setProfil(null);
            }
            QcmTest updated = qcmTestRepository.save(existing);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/tests/{id}")
    public ResponseEntity<Void> deleteTest(@PathVariable Integer id) {
        if (!qcmTestRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        qcmTestRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- 2. GESTION DES QUESTIONS ET CHOIX ---
    @GetMapping("/tests/{idTest}/questions")
    public ResponseEntity<List<Map<String, Object>>> getQuestionsForTest(@PathVariable Integer idTest) {
        List<QcmQuestion> questions = qcmQuestionRepository.findByTestIdOrderByNumeroAsc(idTest);
        List<Map<String, Object>> responseList = new ArrayList<>();

        for (QcmQuestion q : questions) {
            Map<String, Object> qMap = new HashMap<>();
            qMap.put("id", q.getId());
            qMap.put("numero", q.getNumero());
            qMap.put("question", q.getQuestion());
            qMap.put("points", q.getPoints());
            qMap.put("choix", qcmChoixRepository.findByQuestionId(q.getId()));
            responseList.add(qMap);
        }

        return ResponseEntity.ok(responseList);
    }

    @PostMapping("/tests/{idTest}/questions")
    @Transactional
    public ResponseEntity<?> addQuestionToTest(
            @PathVariable Integer idTest,
            @RequestBody Map<String, Object> body) {

        Optional<QcmTest> testOpt = qcmTestRepository.findById(idTest);
        if (testOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String questionText = (String) body.get("question");
        Integer points = body.get("points") != null ? Integer.valueOf(body.get("points").toString()) : 1;
        Integer numero = body.get("numero") != null ? Integer.valueOf(body.get("numero").toString()) : 1;

        QcmQuestion question = new QcmQuestion();
        question.setTest(testOpt.get());
        question.setQuestion(questionText);
        question.setPoints(points);
        question.setNumero(numero);

        QcmQuestion questionSauvegardee = qcmQuestionRepository.save(question);

        if (body.get("choix") instanceof List) {
            List<Map<String, Object>> choixList = (List<Map<String, Object>>) body.get("choix");
            for (Map<String, Object> cMap : choixList) {
                String texte = (String) cMap.get("texte");
                Boolean estCorrect = cMap.get("estcorrect") != null ? Boolean.valueOf(cMap.get("estcorrect").toString()) : false;

                if (texte != null && !texte.isBlank()) {
                    QcmChoix choix = new QcmChoix();
                    choix.setQuestion(questionSauvegardee);
                    choix.setTexte(texte);
                    choix.setEstcorrect(estCorrect);
                    qcmChoixRepository.save(choix);
                }
            }
        }

        return ResponseEntity.ok(questionSauvegardee);
    }

    @DeleteMapping("/questions/{idQuestion}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Integer idQuestion) {
        if (!qcmQuestionRepository.existsById(idQuestion)) {
            return ResponseEntity.notFound().build();
        }
        qcmQuestionRepository.deleteById(idQuestion);
        return ResponseEntity.noContent().build();
    }

    // --- 3. CONSULTATION DES RÉSULTATS DES CANDIDATS ---
    @GetMapping("/resultats/candidats")
    public ResponseEntity<List<Map<String, Object>>> getResultatsCandidats() {
        List<QcmReponse> toutesReponses = qcmReponseRepository.findAll();
        Map<Long, List<QcmReponse>> reponsesParCandidat = toutesReponses.stream()
                .filter(r -> r.getCandidat() != null)
                .collect(Collectors.groupingBy(r -> r.getCandidat().getId()));

        List<Map<String, Object>> resultats = new ArrayList<>();

        for (Map.Entry<Long, List<QcmReponse>> entry : reponsesParCandidat.entrySet()) {
            Long idCand = entry.getKey();
            List<QcmReponse> reps = entry.getValue();
            if (reps.isEmpty()) continue;

            Candidat candidat = reps.get(0).getCandidat();
            QcmTest test = reps.get(0).getTest();

            int totalObtenu = reps.stream().mapToInt(r -> r.getPointsobtenus() != null ? r.getPointsobtenus() : 0).sum();

            // Total points max du test
            List<QcmQuestion> questions = test != null ? qcmQuestionRepository.findByTestIdOrderByNumeroAsc(test.getId()) : Collections.emptyList();
            int totalMax = questions.stream().mapToInt(q -> q.getPoints() != null ? q.getPoints() : 1).sum();
            if (totalMax == 0) totalMax = 1;

            double pourcentage = Math.round(((double) totalObtenu / totalMax) * 100.0 * 10.0) / 10.0;

            Map<String, Object> cMap = new HashMap<>();
            cMap.put("idCandidat", candidat.getId());
            String nomComplet = ((candidat.getPrenom() != null ? candidat.getPrenom() : "") + " " + (candidat.getNom() != null ? candidat.getNom() : "")).trim();
            cMap.put("nomCandidat", nomComplet);
            cMap.put("email", candidat.getCompteCandidat() != null ? candidat.getCompteCandidat().getEmail() : "");
            cMap.put("nomPoste", candidat.getAnnonce() != null ? candidat.getAnnonce().getNomposte() : "");
            cMap.put("nomTest", test != null ? test.getNom() : "QCM Technique");
            cMap.put("scoreObtenu", totalObtenu);
            cMap.put("scoreMax", totalMax);
            cMap.put("pourcentage", pourcentage);
            cMap.put("datePassage", reps.get(0).getDatereponse());

            resultats.add(cMap);
        }

        return ResponseEntity.ok(resultats);
    }

    @GetMapping("/resultats/candidats/{idCandidat}")
    public ResponseEntity<List<Map<String, Object>>> getDetailsReponsesCandidat(@PathVariable Long idCandidat) {
        List<QcmReponse> reponses = qcmReponseRepository.findByCandidatId(idCandidat);
        List<Map<String, Object>> details = new ArrayList<>();

        for (QcmReponse r : reponses) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", r.getId());
            item.put("question", r.getQuestion() != null ? r.getQuestion().getQuestion() : "");
            item.put("pointsQuestion", r.getQuestion() != null ? r.getQuestion().getPoints() : 1);
            item.put("pointsObtenus", r.getPointsobtenus());
            item.put("choixSelectionne", r.getChoix() != null ? r.getChoix().getTexte() : "Aucune réponse");
            item.put("estCorrect", r.getChoix() != null ? r.getChoix().getEstcorrect() : false);

            // Trouver la bonne réponse
            if (r.getQuestion() != null) {
                List<QcmChoix> tousChoix = qcmChoixRepository.findByQuestionId(r.getQuestion().getId());
                Optional<QcmChoix> bonneRepOpt = tousChoix.stream().filter(c -> Boolean.TRUE.equals(c.getEstcorrect())).findFirst();
                item.put("bonneReponse", bonneRepOpt.map(QcmChoix::getTexte).orElse("N/A"));
            }

            details.add(item);
        }

        return ResponseEntity.ok(details);
    }

    // --- 4. EXÉCUTION & CORRECTION AUTOMATIQUE DES QCM (STATUT 'QCM ENVOYÉ' -> 'QCM TERMINÉ') ---
    @GetMapping("/candidats-eligible")
    public ResponseEntity<List<Candidat>> getCandidatsEligiblesQcm() {
        List<Candidat> tous = candidatRepository.findAll();
        List<Candidat> eligibles = tous.stream()
                .filter(c -> c.getStatut() != null &&
                        ("QCM Envoyé".equalsIgnoreCase(c.getStatut().getNom()) || Integer.valueOf(3).equals(c.getStatut().getId())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(eligibles);
    }

    @GetMapping("/candidat/{idCandidat}/test")
    public ResponseEntity<?> getTestForCandidat(@PathVariable Long idCandidat) {
        Optional<Candidat> candOpt = candidatRepository.findById(idCandidat);
        if (candOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Candidat candidat = candOpt.get();
        QcmTest testTrouve = null;

        // 1. Chercher par TestAnnonce si lié directement à l'annonce
        if (candidat.getAnnonce() != null) {
            Long idAnnonce = candidat.getAnnonce().getId();
            List<TestAnnonce> testAnnonces = testAnnonceRepository.findByAnnonceId(idAnnonce);
            if (!testAnnonces.isEmpty()) {
                testTrouve = testAnnonces.get(0).getTest();
            }
        }

        // 2. Sinon chercher par idprofil de l'annonce
        if (testTrouve == null && candidat.getAnnonce() != null && candidat.getAnnonce().getProfil() != null) {
            Integer idProfil = candidat.getAnnonce().getProfil().getId();
            List<QcmTest> testsProfil = qcmTestRepository.findByProfilId(idProfil);
            if (!testsProfil.isEmpty()) {
                testTrouve = testsProfil.get(0);
            }
        }

        // 3. Fallback: premier test disponible
        if (testTrouve == null) {
            List<QcmTest> tousTests = qcmTestRepository.findAll();
            if (!tousTests.isEmpty()) {
                testTrouve = tousTests.get(0);
            }
        }

        if (testTrouve == null) {
            return ResponseEntity.badRequest().body("Aucun test QCM configuré pour ce poste.");
        }

        List<QcmQuestion> questions = qcmQuestionRepository.findByTestIdOrderByNumeroAsc(testTrouve.getId());
        List<Map<String, Object>> questionsMap = new ArrayList<>();
        for (QcmQuestion q : questions) {
            Map<String, Object> qm = new HashMap<>();
            qm.put("id", q.getId());
            qm.put("numero", q.getNumero());
            qm.put("question", q.getQuestion());
            qm.put("points", q.getPoints());
            qm.put("choix", qcmChoixRepository.findByQuestionId(q.getId()));
            questionsMap.add(qm);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("test", testTrouve);
        response.put("candidat", candidat);
        response.put("questions", questionsMap);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/soumettre")
    @Transactional
    public ResponseEntity<?> soumettreEtCorrigerQcm(@RequestBody Map<String, Object> body) {
        if (body.get("idCandidat") == null || body.get("idTest") == null || body.get("reponses") == null) {
            return ResponseEntity.badRequest().body("Données de soumission incomplètes.");
        }

        Long idCandidat = Long.valueOf(body.get("idCandidat").toString());
        Integer idTest = Integer.valueOf(body.get("idTest").toString());

        Optional<Candidat> candOpt = candidatRepository.findById(idCandidat);
        Optional<QcmTest> testOpt = qcmTestRepository.findById(idTest);

        if (candOpt.isEmpty() || testOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Candidat candidat = candOpt.get();
        QcmTest test = testOpt.get();

        List<Map<String, Object>> reponsesList = (List<Map<String, Object>>) body.get("reponses");

        int totalObtenu = 0;

        for (Map<String, Object> rMap : reponsesList) {
            if (rMap.get("idQuestion") == null) continue;

            Integer idQuestion = Integer.valueOf(rMap.get("idQuestion").toString());
            Integer idChoix = rMap.get("idChoix") != null ? Integer.valueOf(rMap.get("idChoix").toString()) : null;

            Optional<QcmQuestion> qOpt = qcmQuestionRepository.findById(idQuestion);
            if (qOpt.isEmpty()) continue;

            QcmQuestion question = qOpt.get();
            QcmChoix choix = null;
            int pointsObtenus = 0;

            if (idChoix != null) {
                Optional<QcmChoix> cOpt = qcmChoixRepository.findById(idChoix);
                if (cOpt.isPresent()) {
                    choix = cOpt.get();
                    if (Boolean.TRUE.equals(choix.getEstcorrect())) {
                        pointsObtenus = question.getPoints() != null ? question.getPoints() : 1;
                    }
                }
            }

            totalObtenu += pointsObtenus;

            QcmReponse reponse = new QcmReponse();
            reponse.setCandidat(candidat);
            reponse.setTest(test);
            reponse.setQuestion(question);
            reponse.setChoix(choix);
            reponse.setPointsobtenus(pointsObtenus);

            qcmReponseRepository.save(reponse);
        }

        // Passer automatiquement le statut à "QCM Terminé" (ID 4)
        StatutCandidat statutQcmTermine = statutCandidatRepository.findByNom("QCM Terminé")
                .orElseGet(() -> statutCandidatRepository.findById(4).orElse(candidat.getStatut()));

        if (statutQcmTermine != null) {
            candidat.setStatut(statutQcmTermine);
            candidatRepository.save(candidat);

            HistoriqueCandidature hist = new HistoriqueCandidature(candidat, statutQcmTermine);
            historiqueCandidatureRepository.save(hist);
        }

        // Calcul score max
        List<QcmQuestion> questions = qcmQuestionRepository.findByTestIdOrderByNumeroAsc(idTest);
        int totalMax = questions.stream().mapToInt(q -> q.getPoints() != null ? q.getPoints() : 1).sum();
        if (totalMax == 0) totalMax = 1;

        double pourcentage = Math.round(((double) totalObtenu / totalMax) * 100.0 * 10.0) / 10.0;

        Map<String, Object> result = new HashMap<>();
        result.put("candidat", candidat);
        result.put("scoreObtenu", totalObtenu);
        result.put("scoreMax", totalMax);
        result.put("pourcentage", pourcentage);
        result.put("message", "Test QCM soumis et corrigé. Statut candidat mis à jour vers QCM Terminé.");

        return ResponseEntity.ok(result);
    }
}
