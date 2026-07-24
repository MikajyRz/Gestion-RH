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
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

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

    public CandidatController(CandidatRepository candidatRepository,
                              AnnonceRepository annonceRepository,
                              StatutCandidatRepository statutCandidatRepository,
                              CritereRepository critereRepository,
                              DiplomeRepository diplomeRepository,
                              CandidatureCritereRepository candidatureCritereRepository) {
        this.candidatRepository = candidatRepository;
        this.annonceRepository = annonceRepository;
        this.statutCandidatRepository = statutCandidatRepository;
        this.critereRepository = critereRepository;
        this.diplomeRepository = diplomeRepository;
        this.candidatureCritereRepository = candidatureCritereRepository;
    }

    @GetMapping
    public ResponseEntity<List<Candidat>> getTousLesCandidats() {
        return ResponseEntity.ok(candidatRepository.findAll());
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

            Candidat candidat = new Candidat();
            candidat.setNom(nom);
            candidat.setPrenom(prenom);
            candidat.setDatenaissance(dateNaissance);
            candidat.setAdresse(adresse);
            candidat.setCv(cvPath);
            candidat.setAnnonce(annonceOpt.get());
            candidat.setStatut(statut);

            Candidat candidatSauvegarde = candidatRepository.save(candidat);

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
}
