package com.gestion.rh.repository;

import com.gestion.rh.model.JourFerie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface JourFerieRepository extends JpaRepository<JourFerie, Integer> {
    List<JourFerie> findByDateFerieBetween(LocalDate debut, LocalDate fin);
}
