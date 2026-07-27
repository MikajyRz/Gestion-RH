package com.gestion.rh.repository;

import com.gestion.rh.model.QcmTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QcmTestRepository extends JpaRepository<QcmTest, Integer> {
    List<QcmTest> findByProfilId(Integer idProfil);
}
