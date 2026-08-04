package com.gestion.rh.repository;

import com.gestion.rh.model.StatutDemandeConge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StatutDemandeCongeRepository extends JpaRepository<StatutDemandeConge, Integer> {
    Optional<StatutDemandeConge> findByCode(String code);
}
