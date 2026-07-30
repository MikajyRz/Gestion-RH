package com.gestion.rh.repository;

import com.gestion.rh.model.HistoriqueEntretien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoriqueEntretienRepository extends JpaRepository<HistoriqueEntretien, Integer> {
    List<HistoriqueEntretien> findByEntretienIdOrderByDatechangementDesc(Integer idEntretien);
}
