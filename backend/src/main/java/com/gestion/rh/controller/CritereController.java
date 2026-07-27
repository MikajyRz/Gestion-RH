package com.gestion.rh.controller;

import com.gestion.rh.model.*;
import com.gestion.rh.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/criteres")
@CrossOrigin(origins = "*")
public class CritereController {

    private final CritereRepository critereRepository;
    private final TypeChampRepository typeChampRepository;
    private final CritereProfilRepository critereProfilRepository;
    private final ProfilRepository profilRepository;

    public CritereController(CritereRepository critereRepository,
                             TypeChampRepository typeChampRepository,
                             CritereProfilRepository critereProfilRepository,
                             ProfilRepository profilRepository) {
        this.critereRepository = critereRepository;
        this.typeChampRepository = typeChampRepository;
        this.critereProfilRepository = critereProfilRepository;
        this.profilRepository = profilRepository;
    }

    // --- CRITÈRES DE BASE ---
    @GetMapping
    public ResponseEntity<List<Critere>> getAllCriteres() {
        return ResponseEntity.ok(critereRepository.findAll());
    }

    @GetMapping("/types-champs")
    public ResponseEntity<List<TypeChamp>> getAllTypeChamps() {
        return ResponseEntity.ok(typeChampRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Critere> createCritere(@RequestBody Critere critere) {
        if (critere.getTypechamp() != null && critere.getTypechamp().getId() != null) {
            typeChampRepository.findById(critere.getTypechamp().getId())
                    .ifPresent(critere::setTypechamp);
        }
        Critere saved = critereRepository.save(critere);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Critere> updateCritere(@PathVariable Integer id, @RequestBody Critere details) {
        return critereRepository.findById(id).map(existing -> {
            existing.setNom(details.getNom());
            if (details.getTypechamp() != null && details.getTypechamp().getId() != null) {
                typeChampRepository.findById(details.getTypechamp().getId())
                        .ifPresent(existing::setTypechamp);
            }
            Critere updated = critereRepository.save(existing);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCritere(@PathVariable Integer id) {
        if (!critereRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        critereRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- RÈGLES CRITÈRES PAR PROFIL (FORMULAIRES DYNAMIQUES) ---
    @GetMapping("/profils/{idProfil}")
    public ResponseEntity<List<CritereProfil>> getCriteresByProfil(@PathVariable Integer idProfil) {
        return ResponseEntity.ok(critereProfilRepository.findByProfilId(idProfil));
    }

    @PostMapping("/profils/{idProfil}")
    public ResponseEntity<CritereProfil> addCritereToProfil(
            @PathVariable Integer idProfil,
            @RequestBody CritereProfil critereProfil) {

        Profil profil = profilRepository.findById(idProfil).orElse(null);
        if (profil == null) {
            return ResponseEntity.notFound().build();
        }

        critereProfil.setProfil(profil);
        if (critereProfil.getCritere() != null && critereProfil.getCritere().getId() != null) {
            critereRepository.findById(critereProfil.getCritere().getId())
                    .ifPresent(critereProfil::setCritere);
        }

        CritereProfil saved = critereProfilRepository.save(critereProfil);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/profils/regles/{id}")
    public ResponseEntity<CritereProfil> updateCritereProfil(
            @PathVariable Integer id,
            @RequestBody CritereProfil details) {

        return critereProfilRepository.findById(id).map(existing -> {
            existing.setValeurdouble(details.getValeurdouble());
            existing.setValeurvarchar(details.getValeurvarchar());
            existing.setValeurbool(details.getValeurbool());
            existing.setEstobligatoire(details.getEstobligatoire());
            CritereProfil updated = critereProfilRepository.save(existing);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/profils/regles/{id}")
    public ResponseEntity<Void> deleteCritereProfil(@PathVariable Integer id) {
        if (!critereProfilRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        critereProfilRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
