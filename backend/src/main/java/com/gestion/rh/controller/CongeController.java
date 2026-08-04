package com.gestion.rh.controller;

import com.gestion.rh.model.*;
import com.gestion.rh.repository.*;
import com.gestion.rh.service.CongeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conges")
@CrossOrigin(origins = "*")
public class CongeController {

    private final CongeService congeService;
    private final TypeCongeRepository typeCongeRepository;
    private final StatutDemandeCongeRepository statutDemandeCongeRepository;
    private final SoldeCongeRepository soldeCongeRepository;
    private final DemandeCongeRepository demandeCongeRepository;
    private final JourFerieRepository jourFerieRepository;
    private final EmployeRepository employeRepository;

    public CongeController(CongeService congeService,
                           TypeCongeRepository typeCongeRepository,
                           StatutDemandeCongeRepository statutDemandeCongeRepository,
                           SoldeCongeRepository soldeCongeRepository,
                           DemandeCongeRepository demandeCongeRepository,
                           JourFerieRepository jourFerieRepository,
                           EmployeRepository employeRepository) {
        this.congeService = congeService;
        this.typeCongeRepository = typeCongeRepository;
        this.statutDemandeCongeRepository = statutDemandeCongeRepository;
        this.soldeCongeRepository = soldeCongeRepository;
        this.demandeCongeRepository = demandeCongeRepository;
        this.jourFerieRepository = jourFerieRepository;
        this.employeRepository = employeRepository;
    }

    @GetMapping("/employes")
    public ResponseEntity<List<Employe>> getTousLesEmployes() {
        return ResponseEntity.ok(employeRepository.findAll());
    }

    @GetMapping("/types")
    public ResponseEntity<List<TypeConge>> getTypesConge() {
        List<TypeConge> types = typeCongeRepository.findAll();
        if (types.isEmpty()) {
            typeCongeRepository.save(new TypeConge("Congé Payé Annuel", true, "Congé légal rémunéré"));
            typeCongeRepository.save(new TypeConge("Congé Maladie", true, "Absence pour santé"));
            typeCongeRepository.save(new TypeConge("Congé Sans Solde", false, "Absence non rémunérée"));
            typeCongeRepository.save(new TypeConge("Congé Maternité / Paternité", true, "Naissance / Adoption"));
            typeCongeRepository.save(new TypeConge("Événement Familial", true, "Mariage / Décès / Naissance"));
            types = typeCongeRepository.findAll();
        }
        return ResponseEntity.ok(types);
    }

    @GetMapping("/statuts")
    public ResponseEntity<List<StatutDemandeConge>> getStatutsDemande() {
        List<StatutDemandeConge> statuts = statutDemandeCongeRepository.findAll();
        if (statuts.isEmpty()) {
            statutDemandeCongeRepository.save(new StatutDemandeConge("EN_ATTENTE", "En attente de validation RH"));
            statutDemandeCongeRepository.save(new StatutDemandeConge("APPROUVE", "Approuvé par RH"));
            statutDemandeCongeRepository.save(new StatutDemandeConge("REFUSE", "Refusé par RH"));
            statutDemandeCongeRepository.save(new StatutDemandeConge("ANNULE", "Annulé"));
            statuts = statutDemandeCongeRepository.findAll();
        }
        return ResponseEntity.ok(statuts);
    }

    @GetMapping("/jours-feries")
    public ResponseEntity<List<JourFerie>> getJoursFeries() {
        return ResponseEntity.ok(jourFerieRepository.findAll());
    }

    @GetMapping("/demandes")
    public ResponseEntity<List<DemandeConge>> getDemandes(
            @RequestParam(required = false) Long idEmploye,
            @RequestParam(required = false) String codeStatut) {

        if (idEmploye != null) {
            return ResponseEntity.ok(demandeCongeRepository.findByEmployeIdOrderByIdDesc(idEmploye));
        }
        if (codeStatut != null && !codeStatut.isBlank()) {
            return ResponseEntity.ok(demandeCongeRepository.findByStatutCodeOrderByIdDesc(codeStatut));
        }
        return ResponseEntity.ok(demandeCongeRepository.findAllByOrderByIdDesc());
    }

    @GetMapping("/soldes")
    public ResponseEntity<List<SoldeConge>> getSoldes(
            @RequestParam(required = false) Long idEmploye,
            @RequestParam(required = false) Integer annee) {

        if (idEmploye != null) {
            if (annee != null) {
                return ResponseEntity.ok(soldeCongeRepository.findByEmployeIdAndAnnee(idEmploye, annee));
            }
            return ResponseEntity.ok(soldeCongeRepository.findByEmployeId(idEmploye));
        }
        return ResponseEntity.ok(soldeCongeRepository.findAll());
    }

    @PostMapping("/calculer-jours-ouvres")
    public ResponseEntity<?> calculerJoursOuvres(@RequestBody Map<String, String> payload) {
        try {
            LocalDate debut = LocalDate.parse(payload.get("dateDebut"));
            LocalDate fin = LocalDate.parse(payload.get("dateFin"));
            int joursOuvres = congeService.calculerJoursOuvres(debut, fin);
            return ResponseEntity.ok(Map.of("nombreJours", joursOuvres));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Dates invalides : " + e.getMessage());
        }
    }

    @PostMapping("/demandes")
    public ResponseEntity<?> creerDemande(@RequestBody Map<String, Object> payload) {
        try {
            Long idEmploye = Long.valueOf(payload.get("idEmploye").toString());
            Integer idTypeConge = Integer.valueOf(payload.get("idTypeConge").toString());
            LocalDate dateDebut = LocalDate.parse(payload.get("dateDebut").toString());
            LocalDate dateFin = LocalDate.parse(payload.get("dateFin").toString());
            String motif = payload.get("motif") != null ? payload.get("motif").toString() : "";

            DemandeConge demande = congeService.creerDemandeConge(idEmploye, idTypeConge, dateDebut, dateFin, motif);
            return ResponseEntity.status(HttpStatus.CREATED).body(demande);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur création demande congé : " + e.getMessage());
        }
    }

    @PostMapping("/demandes/{id}/approuver")
    public ResponseEntity<?> approuverDemande(@PathVariable Integer id, @RequestBody(required = false) Map<String, Object> payload) {
        try {
            Long idValidateurRh = null;
            if (payload != null && payload.get("idValidateurRh") != null) {
                idValidateurRh = Long.valueOf(payload.get("idValidateurRh").toString());
            } else {
                // Défaut sur le premier employé RH si non transmis
                idValidateurRh = employeRepository.findAll().stream().findFirst().map(Employe::getId).orElse(null);
            }

            DemandeConge approuvee = congeService.approuverDemandeConge(id, idValidateurRh);
            return ResponseEntity.ok(approuvee);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur approbation demande : " + e.getMessage());
        }
    }

    @PostMapping("/demandes/{id}/refuser")
    public ResponseEntity<?> refuserDemande(@PathVariable Integer id, @RequestBody Map<String, Object> payload) {
        try {
            Long idValidateurRh = null;
            if (payload.get("idValidateurRh") != null) {
                idValidateurRh = Long.valueOf(payload.get("idValidateurRh").toString());
            } else {
                idValidateurRh = employeRepository.findAll().stream().findFirst().map(Employe::getId).orElse(null);
            }

            String motifRefus = payload.get("commentaireRefus") != null ? payload.get("commentaireRefus").toString() : "Refusé par les RH";

            DemandeConge refusee = congeService.refuserDemandeConge(id, idValidateurRh, motifRefus);
            return ResponseEntity.ok(refusee);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur refus demande : " + e.getMessage());
        }
    }
}
