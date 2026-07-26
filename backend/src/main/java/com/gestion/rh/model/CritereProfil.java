package com.gestion.rh.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "critereprofil")
public class CritereProfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "idprofil")
    private Profil profil;

    @ManyToOne
    @JoinColumn(name = "idcritere")
    private Critere critere;

    @Column(name = "valeurdouble", precision = 10, scale = 2)
    private BigDecimal valeurdouble;

    @Column(name = "valeurvarchar", length = 200)
    private String valeurvarchar;

    @Column(name = "valeurbool")
    private Boolean valeurbool;

    @Column(name = "estobligatoire")
    private Boolean estobligatoire;

    public CritereProfil() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Profil getProfil() {
        return profil;
    }

    public void setProfil(Profil profil) {
        this.profil = profil;
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

    public Boolean getEstobligatoire() {
        return estobligatoire;
    }

    public void setEstobligatoire(Boolean estobligatoire) {
        this.estobligatoire = estobligatoire;
    }
}
