package com.gestion.rh.repository;

import com.gestion.rh.model.Entretien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntretienRepository extends JpaRepository<Entretien, Integer> {
    List<Entretien> findAllByOrderByDateheureAsc();
    List<Entretien> findByCandidatId(Long idCandidat);
}
