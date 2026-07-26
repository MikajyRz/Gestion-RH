package com.gestion.rh.repository;

import com.gestion.rh.model.Critere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CritereRepository extends JpaRepository<Critere, Integer> {
}
