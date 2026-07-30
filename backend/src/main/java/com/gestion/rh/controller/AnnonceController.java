package com.gestion.rh.controller;

import com.gestion.rh.model.*;
import com.gestion.rh.repository.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/annonces")
@CrossOrigin(origins = "*")
public class AnnonceController {

    private final AnnonceRepository annonceRepository;
    private final DepartementRepository departementRepository;
    private final ProfilRepository profilRepository;
    private final TypeAnnonceRepository typeAnnonceRepository;
    private final CritereProfilRepository critereProfilRepository;
    private final DiplomeRepository diplomeRepository;
    private final ProfilDiplomeRepository profilDiplomeRepository;

    public AnnonceController(AnnonceRepository annonceRepository,
            DepartementRepository departementRepository,
            ProfilRepository profilRepository,
            TypeAnnonceRepository typeAnnonceRepository,
            CritereProfilRepository critereProfilRepository,
            DiplomeRepository diplomeRepository,
            ProfilDiplomeRepository profilDiplomeRepository) {
        this.annonceRepository = annonceRepository;
        this.departementRepository = departementRepository;
        this.profilRepository = profilRepository;
        this.typeAnnonceRepository = typeAnnonceRepository;
        this.critereProfilRepository = critereProfilRepository;
        this.diplomeRepository = diplomeRepository;
        this.profilDiplomeRepository = profilDiplomeRepository;
    }

    @GetMapping("/recherche")
    public ResponseEntity<List<Annonce>> chercherAnnonces(
            @RequestParam(required = false) String motCle,
            @RequestParam(required = false) Integer idDepartement,
            @RequestParam(required = false) Integer idProfil,
            @RequestParam(required = false) Integer idTypeAnnonce,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {

        List<Annonce> resultats = annonceRepository.rechercheMulticritere(
                motCle, idDepartement, idProfil, idTypeAnnonce, dateDebut, dateFin);
        return ResponseEntity.ok(resultats);
    }

    @GetMapping("/departements")
    public ResponseEntity<List<Departement>> getDepartements() {
        return ResponseEntity.ok(departementRepository.findAll());
    }

    @GetMapping("/profils")
    public ResponseEntity<List<Profil>> getProfils() {
        return ResponseEntity.ok(profilRepository.findAll());
    }

    @GetMapping("/types-annonce")
    public ResponseEntity<List<TypeAnnonce>> getTypesAnnonce() {
        return ResponseEntity.ok(typeAnnonceRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Annonce> getAnnonceById(@PathVariable Long id) {
        return annonceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/criteres")
    public ResponseEntity<List<CritereProfil>> getCriteresParAnnonce(@PathVariable Long id) {
        return annonceRepository.findById(id)
                .map(annonce -> {
                    if (annonce.getProfil() != null) {
                        return ResponseEntity.ok(critereProfilRepository.findByProfilId(annonce.getProfil().getId()));
                    }
                    return ResponseEntity.ok(Collections.<CritereProfil>emptyList());
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/diplomes")
    public ResponseEntity<List<Diplome>> getDiplomes() {
        return ResponseEntity.ok(diplomeRepository.findAll());
    }

    @GetMapping("/{id}/diplomes-exiges")
    public ResponseEntity<List<ProfilDiplome>> getDiplomesExigesParAnnonce(@PathVariable Long id) {
        return annonceRepository.findById(id)
                .map(annonce -> {
                    if (annonce.getProfil() != null) {
                        return ResponseEntity.ok(profilDiplomeRepository.findByProfilId(annonce.getProfil().getId()));
                    }
                    return ResponseEntity.ok(Collections.<ProfilDiplome>emptyList());
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("")
    public ResponseEntity<List<Annonce>> getAllAnnonces() {
        List<Annonce> list = annonceRepository.rechercheMulticritere(null, null, null, null, null, null);
        return ResponseEntity.ok(list);
    }

    @PostMapping("")
    public ResponseEntity<Annonce> createAnnonce(@RequestBody Annonce annonce) {
        if (annonce.getDatepublication() == null) {
            annonce.setDatepublication(LocalDate.now());
        }
        if (annonce.getDepartement() != null && annonce.getDepartement().getId() != null) {
            departementRepository.findById(annonce.getDepartement().getId())
                .ifPresent(annonce::setDepartement);
        }
        if (annonce.getProfil() != null && annonce.getProfil().getId() != null) {
            profilRepository.findById(annonce.getProfil().getId())
                .ifPresent(annonce::setProfil);
        }
        if (annonce.getTypeannonce() != null && annonce.getTypeannonce().getId() != null) {
            typeAnnonceRepository.findById(annonce.getTypeannonce().getId())
                .ifPresent(annonce::setTypeannonce);
        }
        Annonce saved = annonceRepository.save(annonce);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Annonce> updateAnnonce(@PathVariable Long id, @RequestBody Annonce annonceDetails) {
        return annonceRepository.findById(id).map(existing -> {
            existing.setNomposte(annonceDetails.getNomposte());
            existing.setDescription(annonceDetails.getDescription());
            existing.setDatedebut(annonceDetails.getDatedebut());
            existing.setDatefin(annonceDetails.getDatefin());

            if (annonceDetails.getDatepublication() != null) {
                existing.setDatepublication(annonceDetails.getDatepublication());
            }

            if (annonceDetails.getDepartement() != null && annonceDetails.getDepartement().getId() != null) {
                departementRepository.findById(annonceDetails.getDepartement().getId())
                    .ifPresent(existing::setDepartement);
            } else {
                existing.setDepartement(null);
            }

            if (annonceDetails.getProfil() != null && annonceDetails.getProfil().getId() != null) {
                profilRepository.findById(annonceDetails.getProfil().getId())
                    .ifPresent(existing::setProfil);
            } else {
                existing.setProfil(null);
            }

            if (annonceDetails.getTypeannonce() != null && annonceDetails.getTypeannonce().getId() != null) {
                typeAnnonceRepository.findById(annonceDetails.getTypeannonce().getId())
                    .ifPresent(existing::setTypeannonce);
            } else {
                existing.setTypeannonce(null);
            }

            Annonce updated = annonceRepository.save(existing);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnonce(@PathVariable Long id) {
        if (!annonceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        annonceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}