package com.gestion.rh.controller;

import com.gestion.rh.model.*;
import com.gestion.rh.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/entretiens")
@CrossOrigin(origins = "*")
public class EntretienController {

    private final EntretienRepository entretienRepository;
    private final StatutEntretienRepository statutEntretienRepository;
    private final ResultatRepository resultatRepository;
    private final HistoriqueEntretienRepository historiqueEntretienRepository;
    private final CandidatRepository candidatRepository;
    private final StatutCandidatRepository statutCandidatRepository;
    private final HistoriqueCandidatureRepository historiqueCandidatureRepository;

    public EntretienController(EntretienRepository entretienRepository,
                               StatutEntretienRepository statutEntretienRepository,
                               ResultatRepository resultatRepository,
                               HistoriqueEntretienRepository historiqueEntretienRepository,
                               CandidatRepository candidatRepository,
                               StatutCandidatRepository statutCandidatRepository,
                               HistoriqueCandidatureRepository historiqueCandidatureRepository) {
        this.entretienRepository = entretienRepository;
        this.statutEntretienRepository = statutEntretienRepository;
        this.resultatRepository = resultatRepository;
        this.historiqueEntretienRepository = historiqueEntretienRepository;
        this.candidatRepository = candidatRepository;
        this.statutCandidatRepository = statutCandidatRepository;
        this.historiqueCandidatureRepository = historiqueCandidatureRepository;
    }

    @GetMapping
    public ResponseEntity<List<Entretien>> getAllEntretiens() {
        return ResponseEntity.ok(entretienRepository.findAllByOrderByDateheureAsc());
    }

    @GetMapping("/statuts")
    public ResponseEntity<List<StatutEntretien>> getStatutsEntretien() {
        return ResponseEntity.ok(statutEntretienRepository.findAll());
    }

    @GetMapping("/candidats-eligible")
    public ResponseEntity<List<Candidat>> getCandidatsEligibleEntretien() {
        // Seuls les candidats au statut "QCM Terminé" (ID 4) n'ayant pas encore d'entretien sont éligibles
        List<Candidat> candidats = candidatRepository.findByStatutId(4);
        if (candidats.isEmpty()) {
            candidats = candidatRepository.findByStatutNom("QCM Terminé");
        }

        List<Candidat> eligibles = candidats.stream()
                .filter(c -> entretienRepository.findByCandidatId(c.getId()).isEmpty())
                .collect(Collectors.toList());

        return ResponseEntity.ok(eligibles);
    }

    @PostMapping
    public ResponseEntity<?> createEntretien(@RequestBody Map<String, Object> body) {
        if (body.get("idCandidat") == null || body.get("dateheure") == null) {
            return ResponseEntity.badRequest().body("Le candidat et la date/heure du rendez-vous sont obligatoires.");
        }

        Long idCandidat = Long.valueOf(body.get("idCandidat").toString());
        Optional<Candidat> candOpt = candidatRepository.findById(idCandidat);
        if (candOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Candidat introuvable.");
        }

        LocalDateTime dateheure = LocalDateTime.parse(body.get("dateheure").toString());

        Integer idStatut = 1; // Statut par défaut "En cours"
        if (body.get("idStatut") != null) {
            idStatut = Integer.valueOf(body.get("idStatut").toString());
        }

        StatutEntretien statut = statutEntretienRepository.findById(idStatut)
                .orElseGet(() -> statutEntretienRepository.findByNom("En cours")
                .orElseGet(() -> statutEntretienRepository.findAll().stream().findFirst().orElse(null)));

        Candidat candidat = candOpt.get();

        Entretien entretien = new Entretien();
        entretien.setCandidat(candidat);
        entretien.setDateheure(dateheure);
        entretien.setStatut(statut);

        Entretien saved = entretienRepository.save(entretien);

        if (statut != null) {
            HistoriqueEntretien hist = new HistoriqueEntretien(saved, statut);
            historiqueEntretienRepository.save(hist);
        }

        // Mettre à jour le statut du candidat vers "Entretien Planifié" (ID 5)
        StatutCandidat stEntretienPlanifie = statutCandidatRepository.findById(5)
                .orElseGet(() -> statutCandidatRepository.findByNom("Entretien Planifié").orElse(null));
        if (stEntretienPlanifie != null) {
            candidat.setStatut(stEntretienPlanifie);
            candidatRepository.save(candidat);
            historiqueCandidatureRepository.save(new HistoriqueCandidature(candidat, stEntretienPlanifie));
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<?> updateStatut(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Optional<Entretien> entOpt = entretienRepository.findById(id);
        if (entOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (body.get("idStatut") == null) {
            return ResponseEntity.badRequest().body("L'identifiant du statut est obligatoire.");
        }

        Integer idStatut = Integer.valueOf(body.get("idStatut").toString());
        Optional<StatutEntretien> stOpt = statutEntretienRepository.findById(idStatut);
        if (stOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Statut introuvable.");
        }

        Entretien entretien = entOpt.get();
        StatutEntretien nouveauStatut = stOpt.get();
        entretien.setStatut(nouveauStatut);

        Entretien updated = entretienRepository.save(entretien);

        HistoriqueEntretien hist = new HistoriqueEntretien(updated, nouveauStatut);
        historiqueEntretienRepository.save(hist);

        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/evaluation")
    public ResponseEntity<?> evaluerEntretien(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Optional<Entretien> entOpt = entretienRepository.findById(id);
        if (entOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Integer note = body.get("note") != null ? Integer.valueOf(body.get("note").toString()) : null;
        String appreciation = (String) body.get("appreciation");

        if (note != null && (note < 1 || note > 20)) {
            return ResponseEntity.badRequest().body("La note doit être comprise entre 1 et 20.");
        }

        Entretien entretien = entOpt.get();

        Resultat resultat = entretien.getResultat();
        if (resultat == null) {
            resultat = new Resultat();
        }
        resultat.setNote(note);
        resultat.setAppreciation(appreciation);

        Resultat resSaved = resultatRepository.save(resultat);
        entretien.setResultat(resSaved);

        // Passer automatiquement le statut à "Terminé" (ID 2 ou recherche par nom)
        StatutEntretien statutTermine = statutEntretienRepository.findByNom("Terminé")
                .orElseGet(() -> statutEntretienRepository.findById(2).orElse(entretien.getStatut()));

        if (statutTermine != null) {
            entretien.setStatut(statutTermine);
            HistoriqueEntretien hist = new HistoriqueEntretien(entretien, statutTermine);
            historiqueEntretienRepository.save(hist);
        }

        Entretien updated = entretienRepository.save(entretien);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntretien(@PathVariable Integer id) {
        if (!entretienRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        entretienRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
