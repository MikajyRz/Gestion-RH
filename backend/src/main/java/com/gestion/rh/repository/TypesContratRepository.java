package com.gestion.rh.repository;

import com.gestion.rh.model.TypesContrat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TypesContratRepository extends JpaRepository<TypesContrat, Integer> {
    Optional<TypesContrat> findByCode(String code);
}
