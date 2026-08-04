package com.gestion.rh.repository;

import com.gestion.rh.model.SoldeConge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SoldeCongeRepository extends JpaRepository<SoldeConge, Integer> {
    List<SoldeConge> findByEmployeId(Long idEmploye);
    List<SoldeConge> findByEmployeIdAndAnnee(Long idEmploye, Integer annee);
    Optional<SoldeConge> findByEmployeIdAndTypeCongeIdAndAnnee(Long idEmploye, Integer idTypeConge, Integer annee);
}
