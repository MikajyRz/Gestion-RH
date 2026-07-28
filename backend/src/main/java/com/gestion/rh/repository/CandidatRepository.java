package com.gestion.rh.repository;

import com.gestion.rh.model.Candidat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidatRepository extends JpaRepository<Candidat, Long> {
    List<Candidat> findByAnnonceId(Long idAnnonce);
    List<Candidat> findByStatutId(Integer idStatut);
    List<Candidat> findByStatutNom(String nomStatut);
}
