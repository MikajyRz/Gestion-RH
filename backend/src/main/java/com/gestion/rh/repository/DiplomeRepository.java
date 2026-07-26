package com.gestion.rh.repository;

import com.gestion.rh.model.Diplome;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiplomeRepository extends JpaRepository<Diplome, Integer> {
}
