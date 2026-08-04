package com.gestion.rh.repository;

import com.gestion.rh.model.OffreEmbauche;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OffreEmbaucheRepository extends JpaRepository<OffreEmbauche, Long> {
    Optional<OffreEmbauche> findTopByCandidatIdOrderByIdDesc(Long idCandidat);
    List<OffreEmbauche> findByCandidatId(Long idCandidat);
}
