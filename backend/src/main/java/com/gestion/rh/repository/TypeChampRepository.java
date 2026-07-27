package com.gestion.rh.repository;

import com.gestion.rh.model.TypeChamp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TypeChampRepository extends JpaRepository<TypeChamp, Integer> {
}
