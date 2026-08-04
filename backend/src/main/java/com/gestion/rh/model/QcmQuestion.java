package com.gestion.rh.model;

import jakarta.persistence.*;

@Entity
@Table(name = "qcmquestion")
public class QcmQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_test", nullable = false)
    private QcmTest test;

    @Column(nullable = false)
    private Integer numero;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @Column(nullable = false)
    private Integer points = 1;

    public QcmQuestion() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public QcmTest getTest() {
        return test;
    }

    public void setTest(QcmTest test) {
        this.test = test;
    }

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }
}
