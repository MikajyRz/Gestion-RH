package com.gestion.rh.repository;

import com.gestion.rh.model.Departement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartementRepository extends JpaRepository<Departement, Integer> {}