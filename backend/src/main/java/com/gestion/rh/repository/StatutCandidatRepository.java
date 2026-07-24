package com.gestion.rh.repository;

import com.gestion.rh.model.StatutCandidat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StatutCandidatRepository extends JpaRepository<StatutCandidat, Integer> {
    Optional<StatutCandidat> findByNom(String nom);
}
