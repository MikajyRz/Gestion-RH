package com.gestion.rh.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "demande_conge")
public class DemandeConge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_employe", nullable = false)
    private Employe employe;

    @ManyToOne
    @JoinColumn(name = "id_type_conge", nullable = false)
    private TypeConge typeConge;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    @Column(name = "nombre_jours", nullable = false)
    private Integer nombreJours;

    @Column(columnDefinition = "TEXT")
    private String motif;

    @ManyToOne
    @JoinColumn(name = "id_statut")
    private StatutDemandeConge statut;

    @Column(name = "date_demande")
    private LocalDateTime dateDemande = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "id_validateur_rh")
    private Employe validateurRh;

    @Column(name = "commentaire_refus", columnDefinition = "TEXT")
    private String commentaireRefus;

    public DemandeConge() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Employe getEmploye() {
        return employe;
    }

    public void setEmploye(Employe employe) {
        this.employe = employe;
    }

    public TypeConge getTypeConge() {
        return typeConge;
    }

    public void setTypeConge(TypeConge typeConge) {
        this.typeConge = typeConge;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public Integer getNombreJours() {
        return nombreJours;
    }

    public void setNombreJours(Integer nombreJours) {
        this.nombreJours = nombreJours;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
    }

    public StatutDemandeConge getStatut() {
        return statut;
    }

    public void setStatut(StatutDemandeConge statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateDemande() {
        return dateDemande;
    }

    public void setDateDemande(LocalDateTime dateDemande) {
        this.dateDemande = dateDemande;
    }

    public Employe getValidateurRh() {
        return validateurRh;
    }

    public void setValidateurRh(Employe validateurRh) {
        this.validateurRh = validateurRh;
    }

    public String getCommentaireRefus() {
        return commentaireRefus;
    }

    public void setCommentaireRefus(String commentaireRefus) {
        this.commentaireRefus = commentaireRefus;
    }
}
