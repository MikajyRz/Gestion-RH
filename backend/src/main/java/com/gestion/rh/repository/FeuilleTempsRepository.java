package com.gestion.rh.repository;

import com.gestion.rh.model.FeuilleTemps;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeuilleTempsRepository extends JpaRepository<FeuilleTemps, Long> {
    Optional<FeuilleTemps> findByEmployeIdAndMoisAndAnnee(Long idEmploye, Integer mois, Integer annee);
    List<FeuilleTemps> findByMoisAndAnnee(Integer mois, Integer annee);
}
