package com.gestion.rh.repository;

import com.gestion.rh.model.CompteCandidat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompteCandidatRepository extends JpaRepository<CompteCandidat, Long> {
    Optional<CompteCandidat> findByEmail(String email);
}
