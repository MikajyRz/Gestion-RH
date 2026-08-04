package com.gestion.rh.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "offre_embauche")
public class OffreEmbauche {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_candidat", nullable = false)
    private Candidat candidat;

    @ManyToOne
    @JoinColumn(name = "id_type_contrat")
    private TypesContrat typeContrat;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "nombre_mois")
    private Integer nombreMois;

    @Column(name = "salaire", precision = 12, scale = 2)
    private BigDecimal salaire;

    @Column(name = "remarques", columnDefinition = "TEXT")
    private String remarques;

    @Column(name = "statut", length = 50)
    private String statut; // "OFFRE_TRANSMISE", "ADMIS", "REFUSE"

    @Column(name = "date_proposition")
    private LocalDateTime dateProposition = LocalDateTime.now();

    public OffreEmbauche() {}

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

    public TypesContrat getTypeContrat() {
        return typeContrat;
    }

    public void setTypeContrat(TypesContrat typeContrat) {
        this.typeContrat = typeContrat;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public Integer getNombreMois() {
        return nombreMois;
    }

    public void setNombreMois(Integer nombreMois) {
        this.nombreMois = nombreMois;
    }

    public BigDecimal getSalaire() {
        return salaire;
    }

    public void setSalaire(BigDecimal salaire) {
        this.salaire = salaire;
    }

    public String getRemarques() {
        return remarques;
    }

    public void setRemarques(String remarques) {
        this.remarques = remarques;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateProposition() {
        return dateProposition;
    }

    public void setDateProposition(LocalDateTime dateProposition) {
        this.dateProposition = dateProposition;
    }
}
