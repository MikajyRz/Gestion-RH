package com.gestion.rh.repository;

import com.gestion.rh.model.StatutEntretien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StatutEntretienRepository extends JpaRepository<StatutEntretien, Integer> {
    Optional<StatutEntretien> findByNom(String nom);
}
