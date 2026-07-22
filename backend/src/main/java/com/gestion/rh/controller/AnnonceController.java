package com.gestion.rh.controller;

import com.gestion.rh.model.Annonce;
import com.gestion.rh.model.Departement;
import com.gestion.rh.model.Profil;
import com.gestion.rh.model.TypeAnnonce;
import com.gestion.rh.repository.AnnonceRepository;
import com.gestion.rh.repository.DepartementRepository;
import com.gestion.rh.repository.ProfilRepository;
import com.gestion.rh.repository.TypeAnnonceRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/annonces")
@CrossOrigin(origins = "*")
public class AnnonceController {

    private final AnnonceRepository annonceRepository;
    private final DepartementRepository departementRepository;
    private final ProfilRepository profilRepository;
    private final TypeAnnonceRepository typeAnnonceRepository;

    public AnnonceController(AnnonceRepository annonceRepository,
                             DepartementRepository departementRepository,
                             ProfilRepository profilRepository,
                             TypeAnnonceRepository typeAnnonceRepository) {
        this.annonceRepository = annonceRepository;
        this.departementRepository = departementRepository;
        this.profilRepository = profilRepository;
        this.typeAnnonceRepository = typeAnnonceRepository;
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
            motCle, idDepartement, idProfil, idTypeAnnonce, dateDebut, dateFin
        );
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
}