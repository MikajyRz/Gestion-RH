package com.gestion.rh.repository;

import com.gestion.rh.model.QcmChoix;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QcmChoixRepository extends JpaRepository<QcmChoix, Integer> {
    List<QcmChoix> findByQuestionId(Integer idQuestion);
    void deleteByQuestionId(Integer idQuestion);
}
