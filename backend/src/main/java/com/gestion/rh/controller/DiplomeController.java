package com.gestion.rh.controller;

import com.gestion.rh.model.Diplome;
import com.gestion.rh.repository.DiplomeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diplomes")
@CrossOrigin(origins = "*")
public class DiplomeController {

    private final DiplomeRepository diplomeRepository;

    public DiplomeController(DiplomeRepository diplomeRepository) {
        this.diplomeRepository = diplomeRepository;
    }

    @GetMapping
    public ResponseEntity<List<Diplome>> getAllDiplomes() {
        return ResponseEntity.ok(diplomeRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Diplome> getDiplomeById(@PathVariable Integer id) {
        return diplomeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Diplome> createDiplome(@RequestBody Diplome diplome) {
        Diplome saved = diplomeRepository.save(diplome);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Diplome> updateDiplome(@PathVariable Integer id, @RequestBody Diplome details) {
        return diplomeRepository.findById(id).map(existing -> {
            existing.setNom(details.getNom());
            Diplome updated = diplomeRepository.save(existing);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiplome(@PathVariable Integer id) {
        if (!diplomeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        diplomeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
