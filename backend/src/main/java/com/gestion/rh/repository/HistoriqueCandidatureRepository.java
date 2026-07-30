package com.gestion.rh.repository;

import com.gestion.rh.model.HistoriqueCandidature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoriqueCandidatureRepository extends JpaRepository<HistoriqueCandidature, Long> {
    List<HistoriqueCandidature> findByCandidatIdOrderByDatechangementDesc(Long idCandidat);
}
