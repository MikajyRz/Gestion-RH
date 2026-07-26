package com.gestion.rh.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "candidaturecritere")
public class CandidatureCritere {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idcandidat")
    private Candidat candidat;

    @ManyToOne
    @JoinColumn(name = "idannonce")
    private Annonce annonce;

    @ManyToOne
    @JoinColumn(name = "idcritere")
    private Critere critere;

    @Column(name = "valeurdouble", precision = 10, scale = 2)
    private BigDecimal valeurdouble;

    @Column(name = "valeurvarchar", length = 200)
    private String valeurvarchar;

    @Column(name = "valeurbool")
    private Boolean valeurbool;

    @ManyToOne
    @JoinColumn(name = "iddiplome")
    private Diplome diplome;

    public CandidatureCritere() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Candidat getCandidat() {
        return candidat;
    }

    public void setCandidat(Candidat candidat) {
        this.candidat = candidat;
    }

    public Annonce getAnnonce() {
        return annonce;
    }

    public void setAnnonce(Annonce annonce) {
        this.annonce = annonce;
    }

    public Critere getCritere() {
        return critere;
    }

    public void setCritere(Critere critere) {
        this.critere = critere;
    }

    public BigDecimal getValeurdouble() {
        return valeurdouble;
    }

    public void setValeurdouble(BigDecimal valeurdouble) {
        this.valeurdouble = valeurdouble;
    }

    public String getValeurvarchar() {
        return valeurvarchar;
    }

    public void setValeurvarchar(String valeurvarchar) {
        this.valeurvarchar = valeurvarchar;
    }

    public Boolean getValeurbool() {
        return valeurbool;
    }

    public void setValeurbool(Boolean valeurbool) {
        this.valeurbool = valeurbool;
    }

    public Diplome getDiplome() {
        return diplome;
    }

    public void setDiplome(Diplome diplome) {
        this.diplome = diplome;
    }
}
