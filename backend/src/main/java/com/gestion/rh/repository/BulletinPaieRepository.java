package com.gestion.rh.repository;

import com.gestion.rh.model.BulletinPaie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BulletinPaieRepository extends JpaRepository<BulletinPaie, Long> {
    Optional<BulletinPaie> findByEmployeIdAndMoisAndAnnee(Long idEmploye, Integer mois, Integer annee);
    List<BulletinPaie> findByMoisAndAnnee(Integer mois, Integer annee);
    List<BulletinPaie> findByEmployeId(Long idEmploye);
}
