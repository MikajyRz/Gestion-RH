package com.gestion.rh.model;

import jakarta.persistence.*;

@Entity
@Table(name = "qcmchoix")
public class QcmChoix {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "idquestion", nullable = false)
    private QcmQuestion question;

    @Column(nullable = false, length = 500)
    private String texte;

    @Column(name = "estcorrect")
    private Boolean estcorrect = false;

    public QcmChoix() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public QcmQuestion getQuestion() {
        return question;
    }

    public void setQuestion(QcmQuestion question) {
        this.question = question;
    }

    public String getTexte() {
        return texte;
    }

    public void setTexte(String texte) {
        this.texte = texte;
    }

    public Boolean getEstcorrect() {
        return estcorrect;
    }

    public void setEstcorrect(Boolean estcorrect) {
        this.estcorrect = estcorrect;
    }
}
