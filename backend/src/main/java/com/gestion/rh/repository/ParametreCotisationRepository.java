package com.gestion.rh.repository;

import com.gestion.rh.model.ParametreCotisation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParametreCotisationRepository extends JpaRepository<ParametreCotisation, Long> {
    Optional<ParametreCotisation> findByLibelle(String libelle);
}
