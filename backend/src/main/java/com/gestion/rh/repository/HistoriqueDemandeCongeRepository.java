package com.gestion.rh.repository;

import com.gestion.rh.model.HistoriqueDemandeConge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoriqueDemandeCongeRepository extends JpaRepository<HistoriqueDemandeConge, Integer> {
    List<HistoriqueDemandeConge> findByDemandeCongeIdOrderByIdDesc(Integer idDemandeConge);
}
