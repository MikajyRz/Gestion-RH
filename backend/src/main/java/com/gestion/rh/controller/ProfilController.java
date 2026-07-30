package com.gestion.rh.controller;

import com.gestion.rh.model.Diplome;
import com.gestion.rh.model.Profil;
import com.gestion.rh.model.ProfilDiplome;
import com.gestion.rh.repository.DiplomeRepository;
import com.gestion.rh.repository.ProfilDiplomeRepository;
import com.gestion.rh.repository.ProfilRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/profils")
@CrossOrigin(origins = "*")
public class ProfilController {

    private final ProfilRepository profilRepository;
    private final ProfilDiplomeRepository profilDiplomeRepository;
    private final DiplomeRepository diplomeRepository;

    public ProfilController(ProfilRepository profilRepository,
                            ProfilDiplomeRepository profilDiplomeRepository,
                            DiplomeRepository diplomeRepository) {
        this.profilRepository = profilRepository;
        this.profilDiplomeRepository = profilDiplomeRepository;
        this.diplomeRepository = diplomeRepository;
    }

    @GetMapping
    public ResponseEntity<List<Profil>> getAllProfils() {
        return ResponseEntity.ok(profilRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Profil> getProfilById(@PathVariable Integer id) {
        return profilRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Profil> createProfil(@RequestBody Profil profil) {
        Profil saved = profilRepository.save(profil);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Profil> updateProfil(@PathVariable Integer id, @RequestBody Profil details) {
        return profilRepository.findById(id).map(existing -> {
            existing.setNom(details.getNom());
            Profil updated = profilRepository.save(existing);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfil(@PathVariable Integer id) {
        if (!profilRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        profilDiplomeRepository.deleteByProfilId(id);
        profilRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/diplomes")
    public ResponseEntity<List<ProfilDiplome>> getDiplomesByProfil(@PathVariable Integer id) {
        if (!profilRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profilDiplomeRepository.findByProfilId(id));
    }

    @PostMapping("/{id}/diplomes")
    public ResponseEntity<List<ProfilDiplome>> setDiplomesForProfil(
            @PathVariable Integer id,
            @RequestBody List<Integer> diplomeIds) {

        return profilRepository.findById(id).map(profil -> {
            profilDiplomeRepository.deleteByProfilId(id);

            List<ProfilDiplome> newProfilDiplomes = new ArrayList<>();
            if (diplomeIds != null) {
                for (Integer diplomeId : diplomeIds) {
                    Diplome diplome = diplomeRepository.findById(diplomeId).orElse(null);
                    if (diplome != null) {
                        ProfilDiplome pd = new ProfilDiplome();
                        pd.setProfil(profil);
                        pd.setDiplome(diplome);
                        newProfilDiplomes.add(profilDiplomeRepository.save(pd));
                    }
                }
            }
            return ResponseEntity.ok(newProfilDiplomes);
        }).orElse(ResponseEntity.notFound().build());
    }
}
