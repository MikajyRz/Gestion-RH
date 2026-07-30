package com.gestion.rh.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "qcmreponse")
public class QcmReponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "idcandidat", nullable = false)
    private Candidat candidat;

    @ManyToOne
    @JoinColumn(name = "idtest", nullable = false)
    private QcmTest test;

    @ManyToOne
    @JoinColumn(name = "idquestion", nullable = false)
    private QcmQuestion question;

    @ManyToOne
    @JoinColumn(name = "idchoix")
    private QcmChoix choix;

    @Column(name = "pointsobtenus")
    private Integer pointsobtenus = 0;

    @Column(name = "datereponse")
    private LocalDateTime datereponse = LocalDateTime.now();

    public QcmReponse() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Candidat getCandidat() {
        return candidat;
    }

    public void setCandidat(Candidat candidat) {
        this.candidat = candidat;
    }

    public QcmTest getTest() {
        return test;
    }

    public void setTest(QcmTest test) {
        this.test = test;
    }

    public QcmQuestion getQuestion() {
        return question;
    }

    public void setQuestion(QcmQuestion question) {
        this.question = question;
    }

    public QcmChoix getChoix() {
        return choix;
    }

    public void setChoix(QcmChoix choix) {
        this.choix = choix;
    }

    public Integer getPointsobtenus() {
        return pointsobtenus;
    }

    public void setPointsobtenus(Integer pointsobtenus) {
        this.pointsobtenus = pointsobtenus;
    }

    public LocalDateTime getDatereponse() {
        return datereponse;
    }

    public void setDatereponse(LocalDateTime datereponse) {
        this.datereponse = datereponse;
    }
}
