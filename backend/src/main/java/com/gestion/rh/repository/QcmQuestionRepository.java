package com.gestion.rh.repository;

import com.gestion.rh.model.QcmQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QcmQuestionRepository extends JpaRepository<QcmQuestion, Integer> {
    List<QcmQuestion> findByTestIdOrderByNumeroAsc(Integer idTest);
}
