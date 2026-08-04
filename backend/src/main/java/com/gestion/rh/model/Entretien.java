package com.gestion.rh.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "entretien")
public class Entretien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_candidat", nullable = false)
    private Candidat candidat;

    @Column(name = "date_heure", nullable = false)
    private LocalDateTime dateheure;

    @ManyToOne
    @JoinColumn(name = "id_statut")
    private StatutEntretien statut;

    @ManyToOne
    @JoinColumn(name = "id_resultat")
    private Resultat resultat;

    public Entretien() {}

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

    public LocalDateTime getDateheure() {
        return dateheure;
    }

    public void setDateheure(LocalDateTime dateheure) {
        this.dateheure = dateheure;
    }

    public StatutEntretien getStatut() {
        return statut;
    }

    public void setStatut(StatutEntretien statut) {
        this.statut = statut;
    }

    public Resultat getResultat() {
        return resultat;
    }

    public void setResultat(Resultat resultat) {
        this.resultat = resultat;
    }
}
