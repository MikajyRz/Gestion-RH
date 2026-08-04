package com.gestion.rh.controller;

import com.gestion.rh.model.*;
import com.gestion.rh.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/candidats")
@CrossOrigin(origins = "*")
public class CandidatController {

    @Value("${app.upload.dir:uploads/cv}")
    private String uploadDir;

    private final CandidatRepository candidatRepository;
    private final AnnonceRepository annonceRepository;
    private final StatutCandidatRepository statutCandidatRepository;
    private final CritereRepository critereRepository;
    private final DiplomeRepository diplomeRepository;
    private final CandidatureCritereRepository candidatureCritereRepository;
    private final CompteCandidatRepository compteCandidatRepository;
    private final HistoriqueCandidatureRepository historiqueCandidatureRepository;
    private final CritereProfilRepository critereProfilRepository;
    private final ProfilDiplomeRepository profilDiplomeRepository;
    private final TypesContratRepository typesContratRepository;
    private final OffreEmbaucheRepository offreEmbaucheRepository;
    private final EmployeRepository employeRepository;
    private final ContratRepository contratRepository;
    private final com.gestion.rh.service.ContratPdfService contratPdfService;

    public CandidatController(CandidatRepository candidatRepository,
                              AnnonceRepository annonceRepository,
                              StatutCandidatRepository statutCandidatRepository,
                              CritereRepository critereRepository,
                              DiplomeRepository diplomeRepository,
                              CandidatureCritereRepository candidatureCritereRepository,
                              CompteCandidatRepository compteCandidatRepository,
                              HistoriqueCandidatureRepository historiqueCandidatureRepository,
                              CritereProfilRepository critereProfilRepository,
                              ProfilDiplomeRepository profilDiplomeRepository,
                              TypesContratRepository typesContratRepository,
                              OffreEmbaucheRepository offreEmbaucheRepository,
                              EmployeRepository employeRepository,
                              ContratRepository contratRepository,
                              com.gestion.rh.service.ContratPdfService contratPdfService) {
        this.candidatRepository = candidatRepository;
        this.annonceRepository = annonceRepository;
        this.statutCandidatRepository = statutCandidatRepository;
        this.critereRepository = critereRepository;
        this.diplomeRepository = diplomeRepository;
        this.candidatureCritereRepository = candidatureCritereRepository;
        this.compteCandidatRepository = compteCandidatRepository;
        this.historiqueCandidatureRepository = historiqueCandidatureRepository;
        this.critereProfilRepository = critereProfilRepository;
        this.profilDiplomeRepository = profilDiplomeRepository;
        this.typesContratRepository = typesContratRepository;
        this.offreEmbaucheRepository = offreEmbaucheRepository;
        this.employeRepository = employeRepository;
        this.contratRepository = contratRepository;
        this.contratPdfService = contratPdfService;
    }

    @GetMapping
    public ResponseEntity<List<Candidat>> getTousLesCandidats() {
        return ResponseEntity.ok(candidatRepository.findAll());
    }

    @GetMapping("/statuts")
    public ResponseEntity<List<StatutCandidat>> getStatutsCandidat() {
        return ResponseEntity.ok(statutCandidatRepository.findAll());
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<?> getCandidatDetails(@PathVariable Long id) {
        Optional<Candidat> candOpt = candidatRepository.findById(id);
        if (candOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Candidat candidat = candOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("candidat", candidat);
        response.put("criteresSaisis", candidatureCritereRepository.findByCandidatId(id));
        response.put("historique", historiqueCandidatureRepository.findByCandidatIdOrderByDatechangementDesc(id));

        if (candidat.getAnnonce() != null && candidat.getAnnonce().getProfil() != null) {
            Integer idProfil = candidat.getAnnonce().getProfil().getId();
            response.put("criteresExiges", critereProfilRepository.findByProfilId(idProfil));
            response.put("diplomesExiges", profilDiplomeRepository.findByProfilId(idProfil));
        } else {
            response.put("criteresExiges", Collections.emptyList());
            response.put("diplomesExiges", Collections.emptyList());
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<?> updateStatut(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Optional<Candidat> candOpt = candidatRepository.findById(id);
        if (candOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Candidat candidat = candOpt.get();
        Integer idStatut = null;
        if (body.get("idStatut") != null) {
            idStatut = Integer.valueOf(body.get("idStatut").toString());
        }

        if (idStatut == null) {
            return ResponseEntity.badRequest().body("L'identifiant du statut est obligatoire.");
        }

        Optional<StatutCandidat> stOpt = statutCandidatRepository.findById(idStatut);
        if (stOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Statut introuvable.");
        }

        StatutCandidat nouveauStatut = stOpt.get();
        candidat.setStatut(nouveauStatut);
        Candidat updated = candidatRepository.save(candidat);

        // Traçabilité automatique dans l'historique
        HistoriqueCandidature hist = new HistoriqueCandidature(updated, nouveauStatut);
        historiqueCandidatureRepository.save(hist);

        return ResponseEntity.ok(updated);
    }

    @GetMapping("/cv/{fileName:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> getCvFile(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            if (!Files.exists(filePath)) {
                filePath = Paths.get(fileName).normalize();
            }
            if (Files.exists(filePath)) {
                org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
                return ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/pdf")
                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            }
        } catch (Exception e) {
            // Fichier non trouvé
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Endpoint de postulation avec upload réel du CV.
     * Le frontend envoie un multipart/form-data avec :
     *   - cvFile : le fichier CV (PDF, DOC, DOCX)
     *   - candidature : le JSON de la candidature (nom, prenom, idAnnonce, criteres, etc.)
     */
    @PostMapping("/postuler")
    public ResponseEntity<?> postuler(
            @RequestPart(value = "cvFile", required = false) MultipartFile cvFile,
            @RequestPart("candidature") String candidatureJson) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> payload = mapper.readValue(candidatureJson, new TypeReference<>() {});

            if (!payload.containsKey("idAnnonce") || payload.get("idAnnonce") == null) {
                return ResponseEntity.badRequest().body("L'identifiant de l'annonce est obligatoire.");
            }

            Long idAnnonce = Long.valueOf(payload.get("idAnnonce").toString());
            Optional<Annonce> annonceOpt = annonceRepository.findById(idAnnonce);
            if (annonceOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Annonce non trouvée pour l'ID : " + idAnnonce);
            }

            String nom = (String) payload.get("nom");
            String prenom = (String) payload.get("prenom");
            String adresse = (String) payload.get("adresse");

            LocalDate dateNaissance = null;
            if (payload.get("datenaissance") != null && !payload.get("datenaissance").toString().isBlank()) {
                dateNaissance = LocalDate.parse(payload.get("datenaissance").toString());
            }

            // --- Upload réel du fichier CV ---
            String cvPath = "cv_candidat.pdf";
            if (cvFile != null && !cvFile.isEmpty()) {
                cvPath = saveUploadedFile(cvFile, nom, prenom);
            } else if (payload.get("cv") != null && !payload.get("cv").toString().isBlank()) {
                cvPath = payload.get("cv").toString();
            }

            // Statut par défaut : "En attente" ou ID 1
            StatutCandidat statut = statutCandidatRepository.findByNom("En attente")
                    .orElseGet(() -> statutCandidatRepository.findById(1)
                    .orElseGet(() -> statutCandidatRepository.findAll().stream().findFirst().orElse(null)));

            // --- Création / Récupération automatique du CompteCandidat ---
            String nomClean = nom != null ? nom.trim() : "";
            String prenomClean = prenom != null ? prenom.trim() : "";
            String cleanNomPrenom = (nomClean + prenomClean).toLowerCase().replaceAll("[^a-z0-9]", "");
            if (cleanNomPrenom.isEmpty()) {
                cleanNomPrenom = "candidat" + System.currentTimeMillis();
            }
            String generatedEmail = cleanNomPrenom + "@gmail.com";
            String generatedMdp = generatedEmail;

            CompteCandidat compte = compteCandidatRepository.findByEmail(generatedEmail)
                    .orElseGet(() -> compteCandidatRepository.save(new CompteCandidat(generatedEmail, generatedMdp)));

            Candidat candidat = new Candidat();
            candidat.setNom(nom);
            candidat.setPrenom(prenom);
            candidat.setDatenaissance(dateNaissance);
            candidat.setAdresse(adresse);
            candidat.setCv(cvPath);
            candidat.setAnnonce(annonceOpt.get());
            candidat.setStatut(statut);
            candidat.setCompteCandidat(compte);

            Candidat candidatSauvegarde = candidatRepository.save(candidat);

            // Enregistrement dans l'historique de candidature
            if (statut != null) {
                HistoriqueCandidature historique = new HistoriqueCandidature(candidatSauvegarde, statut);
                historiqueCandidatureRepository.save(historique);
            }

            // Traitement des critères saisis par le candidat
            if (payload.containsKey("criteres") && payload.get("criteres") instanceof List) {
                List<Map<String, Object>> criteresList = (List<Map<String, Object>>) payload.get("criteres");
                for (Map<String, Object> item : criteresList) {
                    if (item.get("idCritere") == null) continue;

                    Integer idCritere = Integer.valueOf(item.get("idCritere").toString());
                    Optional<Critere> critereOpt = critereRepository.findById(idCritere);
                    if (critereOpt.isEmpty()) continue;

                    CandidatureCritere cc = new CandidatureCritere();
                    cc.setCandidat(candidatSauvegarde);
                    cc.setAnnonce(annonceOpt.get());
                    cc.setCritere(critereOpt.get());

                    if (item.get("valeurdouble") != null && !item.get("valeurdouble").toString().isBlank()) {
                        cc.setValeurdouble(new BigDecimal(item.get("valeurdouble").toString()));
                    }
                    if (item.get("valeurvarchar") != null) {
                        cc.setValeurvarchar(item.get("valeurvarchar").toString());
                    }
                    if (item.get("valeurbool") != null) {
                        cc.setValeurbool(Boolean.valueOf(item.get("valeurbool").toString()));
                    }
                    if (item.get("idDiplome") != null && !item.get("idDiplome").toString().isBlank()) {
                        Integer idDiplome = Integer.valueOf(item.get("idDiplome").toString());
                        diplomeRepository.findById(idDiplome).ifPresent(cc::setDiplome);
                    }

                    candidatureCritereRepository.save(cc);
                }
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(candidatSauvegarde);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'enregistrement de la candidature : " + e.getMessage());
        }
    }

    /**
     * Sauvegarde le fichier CV uploadé dans le dossier uploads/cv/.
     * Retourne le chemin relatif enregistré en base de données.
     */
    private String saveUploadedFile(MultipartFile file, String nom, String prenom) throws IOException {
        // Créer le dossier uploads/cv/ s'il n'existe pas
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Générer un nom de fichier unique pour éviter les collisions
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String uniqueName = "CV_" + (nom != null ? nom.toUpperCase().replaceAll("\\s+", "_") : "X")
                + "_" + (prenom != null ? prenom.replaceAll("\\s+", "_") : "X")
                + "_" + UUID.randomUUID().toString().substring(0, 8)
                + extension;

        Path filePath = uploadPath.resolve(uniqueName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Retourner le chemin relatif pour stockage en BDD
        return uploadDir + "/" + uniqueName;
    }

    // --- MODULE D'EMBAUCHE DÉFINITIVE ET PROPOSITION DE CONTRAT ---

    @GetMapping("/types-contrat")
    public ResponseEntity<List<TypesContrat>> getTypesContrat() {
        List<TypesContrat> liste = typesContratRepository.findAll();
        if (liste.isEmpty()) {
            // Auto-population des types de contrat par défaut si la table est vide
            typesContratRepository.save(new TypesContrat("CDI", "Contrat à Durée Indéterminée"));
            typesContratRepository.save(new TypesContrat("CDD", "Contrat à Durée Déterminée"));
            typesContratRepository.save(new TypesContrat("STAGE", "Stage Académique / Professionnel"));
            typesContratRepository.save(new TypesContrat("ALTERNANCE", "Contrat d'Alternance"));
            typesContratRepository.save(new TypesContrat("FREELANCE", "Prestation Indépendante"));
            liste = typesContratRepository.findAll();
        }
        return ResponseEntity.ok(liste);
    }

    @GetMapping("/{id}/offre")
    public ResponseEntity<?> getOffreCandidat(@PathVariable Long id) {
        Optional<OffreEmbauche> offreOpt = offreEmbaucheRepository.findTopByCandidatIdOrderByIdDesc(id);
        if (offreOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(offreOpt.get());
    }

    @PostMapping("/{id}/transmettre-offre")
    public ResponseEntity<?> transmettreOffreEmbauche(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Optional<Candidat> candOpt = candidatRepository.findById(id);
        if (candOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Candidat candidat = candOpt.get();

        Integer idTypeContrat = body.get("idTypeContrat") != null ? Integer.valueOf(body.get("idTypeContrat").toString()) : null;
        TypesContrat typeContrat = null;
        if (idTypeContrat != null) {
            typeContrat = typesContratRepository.findById(idTypeContrat).orElse(null);
        }

        LocalDate dateDebut = null;
        if (body.get("dateDebut") != null && !body.get("dateDebut").toString().isBlank()) {
            dateDebut = LocalDate.parse(body.get("dateDebut").toString());
        }

        Integer nombreMois = body.get("nombreMois") != null && !body.get("nombreMois").toString().isBlank()
                ? Integer.valueOf(body.get("nombreMois").toString()) : null;

        BigDecimal salaire = null;
        if (body.get("salaire") != null && !body.get("salaire").toString().isBlank()) {
            salaire = new BigDecimal(body.get("salaire").toString());
        }

        String remarques = (String) body.get("remarques");

        OffreEmbauche offre = new OffreEmbauche();
        offre.setCandidat(candidat);
        offre.setTypeContrat(typeContrat);
        offre.setDateDebut(dateDebut);
        offre.setNombreMois(nombreMois);
        offre.setSalaire(salaire);
        offre.setRemarques(remarques);
        offre.setStatut("OFFRE_TRANSMISE");

        OffreEmbauche savedOffre = offreEmbaucheRepository.save(offre);

        // Passer le statut du candidat à "Offre Transmise" (ID 6)
        StatutCandidat stOffreTransmise = statutCandidatRepository.findById(6)
                .orElseGet(() -> statutCandidatRepository.findByNom("Offre Transmise").orElse(null));

        if (stOffreTransmise != null) {
            candidat.setStatut(stOffreTransmise);
            candidatRepository.save(candidat);
            historiqueCandidatureRepository.save(new HistoriqueCandidature(candidat, stOffreTransmise));
        }

        return ResponseEntity.ok(savedOffre);
    }

    @PostMapping("/{id}/valider-embauche")
    public ResponseEntity<?> validerEmbaucheDefinitive(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Optional<Candidat> candOpt = candidatRepository.findById(id);
        if (candOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Candidat candidat = candOpt.get();
        String action = body.get("action") != null ? body.get("action").toString().toUpperCase() : "ADMIS";

        Optional<OffreEmbauche> offreOpt = offreEmbaucheRepository.findTopByCandidatIdOrderByIdDesc(id);

        if ("ADMIS".equals(action) || "EMBAUCHER".equals(action)) {
            StatutCandidat stAdmis = statutCandidatRepository.findById(7)
                    .orElseGet(() -> statutCandidatRepository.findByNom("Admis / Embauché").orElse(null));
            if (stAdmis != null) {
                candidat.setStatut(stAdmis);
                candidatRepository.save(candidat);
                historiqueCandidatureRepository.save(new HistoriqueCandidature(candidat, stAdmis));
            }
            
            OffreEmbauche offre = offreOpt.orElse(null);
            if (offre != null) {
                offre.setStatut("ACCEPTEE");
                offreEmbaucheRepository.save(offre);
            }

            // CRÉATION AUTOMATIQUE EN BDD : CANDIDAT -> EMPLOYÉ & ENREGISTREMENT DU CONTRAT
            String emailEmploye = candidat.getCompteCandidat() != null ? candidat.getCompteCandidat().getEmail()
                    : ((candidat.getPrenom() != null ? candidat.getPrenom().toLowerCase().replaceAll("\\s+", "") : "candidat")
                       + "." + (candidat.getNom() != null ? candidat.getNom().toLowerCase().replaceAll("\\s+", "") : "rh")
                       + "@entreprise.com");

            Employe employe = employeRepository.findByEmail(emailEmploye)
                    .orElseGet(() -> employeRepository.save(new Employe(candidat.getNom(), candidat.getPrenom(), emailEmploye)));

            // Création du contrat de travail associé
            LocalDate dateDebut = (offre != null && offre.getDateDebut() != null) ? offre.getDateDebut() : LocalDate.now();
            Integer nombreMois = (offre != null) ? offre.getNombreMois() : null;
            TypesContrat typeContrat = (offre != null) ? offre.getTypeContrat() : null;

            Contrat nouveauContrat = new Contrat(employe, dateDebut, nombreMois, typeContrat);
            Contrat savedContrat = contratRepository.save(nouveauContrat);

            // CRÉATION AUTOMATIQUE DU PDF DANS UPLOADS/CONTRAT/CONTRAT(NOMEMPLOYE).PDF
            String pdfPath = null;
            try {
                java.io.File pdfFile = contratPdfService.genererEtSauvegarderContratPdf(candidat, offre);
                pdfPath = "uploads/contrat/" + pdfFile.getName();
            } catch (Exception e) {
                System.err.println("Erreur création PDF contrat : " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                "message", "Candidat admis et inséré dans la table des employés avec son contrat de travail PDF.",
                "candidat", candidat,
                "employe", employe,
                "contrat", savedContrat,
                "pdfUrl", pdfPath != null ? pdfPath : ""
            ));
        } else {
            StatutCandidat stRefuse = statutCandidatRepository.findById(8)
                    .orElseGet(() -> statutCandidatRepository.findByNom("Refusé").orElse(null));
            if (stRefuse != null) {
                candidat.setStatut(stRefuse);
                candidatRepository.save(candidat);
                historiqueCandidatureRepository.save(new HistoriqueCandidature(candidat, stRefuse));
            }
            offreOpt.ifPresent(o -> {
                o.setStatut("DECLINEE");
                offreEmbaucheRepository.save(o);
            });
            return ResponseEntity.ok(Map.of("message", "Offre d'embauche marquée comme déclinée / refusée.", "candidat", candidat));
        }
    }

    @GetMapping("/{id}/exporter-contrat-pdf")
    public ResponseEntity<?> exporterContratPdf(@PathVariable Long id) {
        Optional<Candidat> candOpt = candidatRepository.findById(id);
        if (candOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Candidat candidat = candOpt.get();
        OffreEmbauche offre = offreEmbaucheRepository.findTopByCandidatIdOrderByIdDesc(id).orElse(null);

        try {
            java.io.File pdfFile = contratPdfService.genererEtSauvegarderContratPdf(candidat, offre);
            byte[] bytes = java.nio.file.Files.readAllBytes(pdfFile.toPath());

            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=\"" + pdfFile.getName() + "\"")
                    .body(bytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la génération du contrat PDF : " + e.getMessage());
        }
    }
}
