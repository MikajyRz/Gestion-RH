package com.gestion.rh.repository;

import com.gestion.rh.model.TypeConge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TypeCongeRepository extends JpaRepository<TypeConge, Integer> {
    Optional<TypeConge> findByLibelle(String libelle);
}
