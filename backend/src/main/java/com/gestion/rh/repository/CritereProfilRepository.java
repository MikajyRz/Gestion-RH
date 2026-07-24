package com.gestion.rh.repository;

import com.gestion.rh.model.CritereProfil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CritereProfilRepository extends JpaRepository<CritereProfil, Integer> {
    List<CritereProfil> findByProfilId(Integer idProfil);
}
