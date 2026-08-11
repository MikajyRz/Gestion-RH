package com.gestion.rh.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ligne_bulletin_paie")
public class LigneBulletinPaie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_bulletin_paie", nullable = false)
    private BulletinPaie bulletinPaie;

    @Column(name = "code_rubrique", nullable = false, length = 50)
    private String codeRubrique;

    @Column(name = "libelle", nullable = false, length = 150)
    private String libelle;

    @Column(name = "type_ligne", nullable = false, length = 20)
    private String typeLigne; // "GAIN" ou "RETENUE"

    @Column(name = "nombre_unite", precision = 10, scale = 2)
    private BigDecimal nombreUnite;

    @Column(name = "base_calcul", precision = 12, scale = 2)
    private BigDecimal baseCalcul;

    @Column(name = "taux_pourcentage", precision = 6, scale = 2)
    private BigDecimal tauxPourcentage;

    @Column(name = "montant_gain", precision = 12, scale = 2)
    private BigDecimal montantGain = BigDecimal.ZERO;

    @Column(name = "montant_retenue", precision = 12, scale = 2)
    private BigDecimal montantRetenue = BigDecimal.ZERO;

    public LigneBulletinPaie() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BulletinPaie getBulletinPaie() {
        return bulletinPaie;
    }

    public void setBulletinPaie(BulletinPaie bulletinPaie) {
        this.bulletinPaie = bulletinPaie;
    }

    public String getCodeRubrique() {
        return codeRubrique;
    }

    public void setCodeRubrique(String codeRubrique) {
        this.codeRubrique = codeRubrique;
    }

    public String getLibelle() {
        return libelle;
    }

    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }

    public String getTypeLigne() {
        return typeLigne;
    }

    public void setTypeLigne(String typeLigne) {
        this.typeLigne = typeLigne;
    }

    public BigDecimal getNombreUnite() {
        return nombreUnite;
    }

    public void setNombreUnite(BigDecimal nombreUnite) {
        this.nombreUnite = nombreUnite;
    }

    public BigDecimal getBaseCalcul() {
        return baseCalcul;
    }

    public void setBaseCalcul(BigDecimal baseCalcul) {
        this.baseCalcul = baseCalcul;
    }

    public BigDecimal getTauxPourcentage() {
        return tauxPourcentage;
    }

    public void setTauxPourcentage(BigDecimal tauxPourcentage) {
        this.tauxPourcentage = tauxPourcentage;
    }

    public BigDecimal getMontantGain() {
        return montantGain;
    }

    public void setMontantGain(BigDecimal montantGain) {
        this.montantGain = montantGain;
    }

    public BigDecimal getMontantRetenue() {
        return montantRetenue;
    }

    public void setMontantRetenue(BigDecimal montantRetenue) {
        this.montantRetenue = montantRetenue;
    }
}
