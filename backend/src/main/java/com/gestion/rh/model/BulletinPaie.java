package com.gestion.rh.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bulletin_paie", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"id_employe", "mois", "annee"})
})
public class BulletinPaie {

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

    @Column(name = "salaire_base", nullable = false, precision = 12, scale = 2)
    private BigDecimal salaireBase;

    @Column(name = "taux_journalier", precision = 12, scale = 2)
    private BigDecimal tauxJournalier;

    @Column(name = "taux_horaire", precision = 12, scale = 2)
    private BigDecimal tauxHoraire;

    @Column(name = "total_heures_sup", precision = 12, scale = 2)
    private BigDecimal totalHeuresSup = BigDecimal.ZERO;

    @Column(name = "total_primes", precision = 12, scale = 2)
    private BigDecimal totalPrimes = BigDecimal.ZERO;

    @Column(name = "deduction_absences", precision = 12, scale = 2)
    private BigDecimal deductionAbsences = BigDecimal.ZERO;

    @Column(name = "salaire_brut", nullable = false, precision = 12, scale = 2)
    private BigDecimal salaireBrut;

    @Column(name = "cnaps_salarie", precision = 12, scale = 2)
    private BigDecimal cnapsSalarie = BigDecimal.ZERO;

    @Column(name = "ostie_salarie", precision = 12, scale = 2)
    private BigDecimal ostieSalarie = BigDecimal.ZERO;

    @Column(name = "total_cotisations", precision = 12, scale = 2)
    private BigDecimal totalCotisations = BigDecimal.ZERO;

    @Column(name = "salaire_imposable", precision = 12, scale = 2)
    private BigDecimal salaireImposable = BigDecimal.ZERO;

    @Column(name = "total_irsa", precision = 12, scale = 2)
    private BigDecimal totalIrsa = BigDecimal.ZERO;

    @Column(name = "avance_acompte", precision = 12, scale = 2)
    private BigDecimal avanceAcompte = BigDecimal.ZERO;

    @Column(name = "total_retenues", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalRetenues;

    @Column(name = "salaire_net", nullable = false, precision = 12, scale = 2)
    private BigDecimal salaireNet;

    @ManyToOne
    @JoinColumn(name = "id_statut")
    private StatutBulletin statut;

    @Column(name = "date_emission")
    private LocalDateTime dateEmission = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "id_validateur_rh")
    private Employe validateurRh;

    @Column(name = "mode_paiement", length = 50)
    private String modePaiement = "Virement/chèque";

    public BulletinPaie() {
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

    public BigDecimal getSalaireBase() {
        return salaireBase;
    }

    public void setSalaireBase(BigDecimal salaireBase) {
        this.salaireBase = salaireBase;
    }

    public BigDecimal getTauxJournalier() {
        return tauxJournalier;
    }

    public void setTauxJournalier(BigDecimal tauxJournalier) {
        this.tauxJournalier = tauxJournalier;
    }

    public BigDecimal getTauxHoraire() {
        return tauxHoraire;
    }

    public void setTauxHoraire(BigDecimal tauxHoraire) {
        this.tauxHoraire = tauxHoraire;
    }

    public BigDecimal getTotalHeuresSup() {
        return totalHeuresSup;
    }

    public void setTotalHeuresSup(BigDecimal totalHeuresSup) {
        this.totalHeuresSup = totalHeuresSup;
    }

    public BigDecimal getTotalPrimes() {
        return totalPrimes;
    }

    public void setTotalPrimes(BigDecimal totalPrimes) {
        this.totalPrimes = totalPrimes;
    }

    public BigDecimal getDeductionAbsences() {
        return deductionAbsences;
    }

    public void setDeductionAbsences(BigDecimal deductionAbsences) {
        this.deductionAbsences = deductionAbsences;
    }

    public BigDecimal getSalaireBrut() {
        return salaireBrut;
    }

    public void setSalaireBrut(BigDecimal salaireBrut) {
        this.salaireBrut = salaireBrut;
    }

    public BigDecimal getCnapsSalarie() {
        return cnapsSalarie;
    }

    public void setCnapsSalarie(BigDecimal cnapsSalarie) {
        this.cnapsSalarie = cnapsSalarie;
    }

    public BigDecimal getOstieSalarie() {
        return ostieSalarie;
    }

    public void setOstieSalarie(BigDecimal ostieSalarie) {
        this.ostieSalarie = ostieSalarie;
    }

    public BigDecimal getTotalCotisations() {
        return totalCotisations;
    }

    public void setTotalCotisations(BigDecimal totalCotisations) {
        this.totalCotisations = totalCotisations;
    }

    public BigDecimal getSalaireImposable() {
        return salaireImposable;
    }

    public void setSalaireImposable(BigDecimal salaireImposable) {
        this.salaireImposable = salaireImposable;
    }

    public BigDecimal getTotalIrsa() {
        return totalIrsa;
    }

    public void setTotalIrsa(BigDecimal totalIrsa) {
        this.totalIrsa = totalIrsa;
    }

    public BigDecimal getAvanceAcompte() {
        return avanceAcompte;
    }

    public void setAvanceAcompte(BigDecimal avanceAcompte) {
        this.avanceAcompte = avanceAcompte;
    }

    public BigDecimal getTotalRetenues() {
        return totalRetenues;
    }

    public void setTotalRetenues(BigDecimal totalRetenues) {
        this.totalRetenues = totalRetenues;
    }

    public BigDecimal getSalaireNet() {
        return salaireNet;
    }

    public void setSalaireNet(BigDecimal salaireNet) {
        this.salaireNet = salaireNet;
    }

    public StatutBulletin getStatut() {
        return statut;
    }

    public void setStatut(StatutBulletin statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateEmission() {
        return dateEmission;
    }

    public void setDateEmission(LocalDateTime dateEmission) {
        this.dateEmission = dateEmission;
    }

    public Employe getValidateurRh() {
        return validateurRh;
    }

    public void setValidateurRh(Employe validateurRh) {
        this.validateurRh = validateurRh;
    }

    public String getModePaiement() {
        return modePaiement;
    }

    public void setModePaiement(String modePaiement) {
        this.modePaiement = modePaiement;
    }
}
