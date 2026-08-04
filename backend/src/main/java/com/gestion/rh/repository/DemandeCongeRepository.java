package com.gestion.rh.repository;

import com.gestion.rh.model.DemandeConge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DemandeCongeRepository extends JpaRepository<DemandeConge, Integer> {
    List<DemandeConge> findByEmployeIdOrderByIdDesc(Long idEmploye);
    List<DemandeConge> findByStatutCodeOrderByIdDesc(String codeStatut);
    List<DemandeConge> findAllByOrderByIdDesc();
}
