package com.gestion.rh.controller;

import com.gestion.rh.model.BulletinPaie;
import com.gestion.rh.model.FeuilleTemps;
import com.gestion.rh.model.ParametreCotisation;
import com.gestion.rh.repository.BulletinPaieRepository;
import com.gestion.rh.repository.FeuilleTempsRepository;
import com.gestion.rh.repository.ParametreCotisationRepository;
import com.gestion.rh.service.BulletinPdfService;
import com.gestion.rh.service.PaieService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/paie")
@CrossOrigin(origins = "*")
public class PaieController {

    private final PaieService paieService;
    private final BulletinPdfService bulletinPdfService;
    private final BulletinPaieRepository bulletinPaieRepository;
    private final FeuilleTempsRepository feuilleTempsRepository;
    private final ParametreCotisationRepository parametreCotisationRepository;

    public PaieController(PaieService paieService,
                          BulletinPdfService bulletinPdfService,
                          BulletinPaieRepository bulletinPaieRepository,
                          FeuilleTempsRepository feuilleTempsRepository,
                          ParametreCotisationRepository parametreCotisationRepository) {
        this.paieService = paieService;
        this.bulletinPdfService = bulletinPdfService;
        this.bulletinPaieRepository = bulletinPaieRepository;
        this.feuilleTempsRepository = feuilleTempsRepository;
        this.parametreCotisationRepository = parametreCotisationRepository;
    }

    @GetMapping("/bulletins")
    public ResponseEntity<List<BulletinPaie>> getBulletins(
            @RequestParam(required = false) Integer mois,
            @RequestParam(required = false) Integer annee,
            @RequestParam(required = false) Long idEmploye) {
        
        int targetMois = (mois != null) ? mois : LocalDate.now().getMonthValue();
        int targetAnnee = (annee != null) ? annee : LocalDate.now().getYear();

        if (idEmploye != null) {
            return ResponseEntity.ok(bulletinPaieRepository.findByEmployeId(idEmploye));
        }

        return ResponseEntity.ok(bulletinPaieRepository.findByMoisAndAnnee(targetMois, targetAnnee));
    }

    @GetMapping("/bulletins/{id}")
    public ResponseEntity<BulletinPaie> getBulletinById(@PathVariable Long id) {
        return bulletinPaieRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/generer")
    public ResponseEntity<?> genererPaieDuMois(
            @RequestParam(required = false) Integer mois,
            @RequestParam(required = false) Integer annee) {

        try {
            int targetMois = (mois != null) ? mois : LocalDate.now().getMonthValue();
            int targetAnnee = (annee != null) ? annee : LocalDate.now().getYear();

            List<BulletinPaie> bulletins = paieService.genererPaieDuMois(targetMois, targetAnnee);
            return ResponseEntity.ok(bulletins);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur lors de la génération de la paie : " + e.getMessage());
        }
    }

    @PostMapping("/bulletins/{id}/valider")
    public ResponseEntity<?> validerBulletin(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> payload) {

        try {
            Long idValidateur = null;
            if (payload != null && payload.get("idValidateur") != null) {
                idValidateur = Long.valueOf(payload.get("idValidateur").toString());
            }

            BulletinPaie bulletin = paieService.validerBulletin(id, idValidateur);
            return ResponseEntity.ok(bulletin);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur lors de la validation du bulletin : " + e.getMessage());
        }
    }

    @GetMapping("/bulletins/{id}/pdf")
    public ResponseEntity<?> exporterBulletinPdf(@PathVariable Long id) {
        try {
            BulletinPaie bulletin = bulletinPaieRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Bulletin introuvable id=" + id));

            File file = bulletinPdfService.genererBulletinPdf(bulletin);
            Resource resource = new FileSystemResource(file);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(file.length())
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur lors de la génération du PDF : " + e.getMessage());
        }
    }

    @GetMapping("/feuilles-temps")
    public ResponseEntity<?> getFeuillesTemps(
            @RequestParam(required = false) Integer mois,
            @RequestParam(required = false) Integer annee) {

        try {
            int targetMois = (mois != null) ? mois : LocalDate.now().getMonthValue();
            int targetAnnee = (annee != null) ? annee : LocalDate.now().getYear();

            return ResponseEntity.ok(feuilleTempsRepository.findByMoisAndAnnee(targetMois, targetAnnee));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur lors de la récupération des feuilles de temps : " + e.getMessage());
        }
    }

    @PostMapping("/feuilles-temps")
    public ResponseEntity<?> enregistrerFeuilleTemps(@RequestBody FeuilleTemps feuilleTemps) {
        try {
            if (feuilleTemps.getEmploye() != null && feuilleTemps.getEmploye().getId() != null) {
                java.util.Optional<FeuilleTemps> ftExist = feuilleTempsRepository.findByEmployeIdAndMoisAndAnnee(
                        feuilleTemps.getEmploye().getId(), feuilleTemps.getMois(), feuilleTemps.getAnnee());
                if (ftExist.isPresent()) {
                    FeuilleTemps existing = ftExist.get();
                    existing.setJoursTravailles(feuilleTemps.getJoursTravailles());
                    existing.setHeuresSup30(feuilleTemps.getHeuresSup30());
                    existing.setHeuresSup40(feuilleTemps.getHeuresSup40());
                    existing.setHeuresSup50(feuilleTemps.getHeuresSup50());
                    existing.setHeuresSup100(feuilleTemps.getHeuresSup100());
                    existing.setHeuresNuit(feuilleTemps.getHeuresNuit());
                    existing.setJoursAbsences(feuilleTemps.getJoursAbsences());
                    feuilleTemps = existing;
                }
            }

            FeuilleTemps saved = feuilleTempsRepository.save(feuilleTemps);
            if (saved.getEmploye() != null && saved.getEmploye().getId() != null) {
                paieService.calculerBulletinEmploye(saved.getEmploye().getId(), saved.getMois(), saved.getAnnee());
            }
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur lors de l'enregistrement de la feuille de temps : " + e.getMessage());
        }
    }

    @GetMapping("/parametres")
    public ResponseEntity<List<ParametreCotisation>> getParametresCotisation() {
        return ResponseEntity.ok(parametreCotisationRepository.findAll());
    }
}
