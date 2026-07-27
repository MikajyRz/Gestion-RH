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

    public QcmController(QcmTestRepository qcmTestRepository,
                         QcmQuestionRepository qcmQuestionRepository,
                         QcmChoixRepository qcmChoixRepository,
                         QcmReponseRepository qcmReponseRepository,
                         ProfilRepository profilRepository,
                         CandidatRepository candidatRepository) {
        this.qcmTestRepository = qcmTestRepository;
        this.qcmQuestionRepository = qcmQuestionRepository;
        this.qcmChoixRepository = qcmChoixRepository;
        this.qcmReponseRepository = qcmReponseRepository;
        this.profilRepository = profilRepository;
        this.candidatRepository = candidatRepository;
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
}
