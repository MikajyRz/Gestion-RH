package com.gestion.rh.model;

import jakarta.persistence.*;

@Entity
@Table(name = "testannonce")
public class TestAnnonce {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "idtest", nullable = false)
    private QcmTest test;

    @ManyToOne
    @JoinColumn(name = "idannonce", nullable = false)
    private Annonce annonce;

    public TestAnnonce() {}

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

    public Annonce getAnnonce() {
        return annonce;
    }

    public void setAnnonce(Annonce annonce) {
        this.annonce = annonce;
    }
}
