package com.gestion.rh.repository;

import com.gestion.rh.model.CandidatureCritere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidatureCritereRepository extends JpaRepository<CandidatureCritere, Long> {
    List<CandidatureCritere> findByCandidatId(Long idCandidat);
}
