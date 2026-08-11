package com.gestion.rh.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "feuille_temps", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"id_employe", "mois", "annee"})
})
public class FeuilleTemps {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_employe", nullable = false)
    private Employe employe;

    @Column(name = "mois", nullable = false)
    private Integer mois;

    @Column(name = "annee", nullable = false)
    private Integer annee;

    @Column(name = "jours_travailles", precision = 5, scale = 2)
    private BigDecimal joursTravailles = new BigDecimal("22");

    @Column(name = "heures_sup_30", precision = 6, scale = 2)
    private BigDecimal heuresSup30 = BigDecimal.ZERO;

    @Column(name = "heures_sup_40", precision = 6, scale = 2)
    private BigDecimal heuresSup40 = BigDecimal.ZERO;

    @Column(name = "heures_sup_50", precision = 6, scale = 2)
    private BigDecimal heuresSup50 = BigDecimal.ZERO;

    @Column(name = "heures_sup_100", precision = 6, scale = 2)
    private BigDecimal heuresSup100 = BigDecimal.ZERO;

    @Column(name = "heures_nuit", precision = 6, scale = 2)
    private BigDecimal heuresNuit = BigDecimal.ZERO;

    @Column(name = "jours_absences", precision = 5, scale = 2)
    private BigDecimal joursAbsences = BigDecimal.ZERO;

    @Column(name = "retards_minutes")
    private Integer retardsMinutes = 0;

    @Column(name = "date_cloture")
    private LocalDateTime dateCloture;

    @ManyToOne
    @JoinColumn(name = "id_valideur_rh")
    private Employe valideurRh;

    public FeuilleTemps() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employe getEmploye() {
        return employe;
    }

    public void setEmploye(Employe employe) {
        this.employe = employe;
    }

    public Integer getMois() {
        return mois;
    }

    public void setMois(Integer mois) {
        this.mois = mois;
    }

    public Integer getAnnee() {
        return annee;
    }

    public void setAnnee(Integer annee) {
        this.annee = annee;
    }

    public BigDecimal getJoursTravailles() {
        return joursTravailles;
    }

    public void setJoursTravailles(BigDecimal joursTravailles) {
        this.joursTravailles = joursTravailles;
    }

    public BigDecimal getHeuresSup30() {
        return heuresSup30;
    }

    public void setHeuresSup30(BigDecimal heuresSup30) {
        this.heuresSup30 = heuresSup30;
    }

    public BigDecimal getHeuresSup40() {
        return heuresSup40;
    }

    public void setHeuresSup40(BigDecimal heuresSup40) {
        this.heuresSup40 = heuresSup40;
    }

    public BigDecimal getHeuresSup50() {
        return heuresSup50;
    }

    public void setHeuresSup50(BigDecimal heuresSup50) {
        this.heuresSup50 = heuresSup50;
    }

    public BigDecimal getHeuresSup100() {
        return heuresSup100;
    }

    public void setHeuresSup100(BigDecimal heuresSup100) {
        this.heuresSup100 = heuresSup100;
    }

    public BigDecimal getHeuresNuit() {
        return heuresNuit;
    }

    public void setHeuresNuit(BigDecimal heuresNuit) {
        this.heuresNuit = heuresNuit;
    }

    public BigDecimal getJoursAbsences() {
        return joursAbsences;
    }

    public void setJoursAbsences(BigDecimal joursAbsences) {
        this.joursAbsences = joursAbsences;
    }

    public Integer getRetardsMinutes() {
        return retardsMinutes;
    }

    public void setRetardsMinutes(Integer retardsMinutes) {
        this.retardsMinutes = retardsMinutes;
    }

    public LocalDateTime getDateCloture() {
        return dateCloture;
    }

    public void setDateCloture(LocalDateTime dateCloture) {
        this.dateCloture = dateCloture;
    }

    public Employe getValideurRh() {
        return valideurRh;
    }

    public void setValideurRh(Employe valideurRh) {
        this.valideurRh = valideurRh;
    }
}
