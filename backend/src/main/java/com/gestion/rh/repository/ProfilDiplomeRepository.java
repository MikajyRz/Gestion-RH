package com.gestion.rh.repository;

import com.gestion.rh.model.ProfilDiplome;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ProfilDiplomeRepository extends JpaRepository<ProfilDiplome, Integer> {
    List<ProfilDiplome> findByProfilId(Integer idProfil);

    @Transactional
    void deleteByProfilId(Integer idProfil);
}
