package com.gestion.rh.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historique_demande_conge")
public class HistoriqueDemandeConge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_demande_conge", nullable = false)
    private DemandeConge demandeConge;

    @ManyToOne
    @JoinColumn(name = "id_statut", nullable = false)
    private StatutDemandeConge statut;

    @Column(name = "date_changement")
    private LocalDateTime dateChangement = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    public HistoriqueDemandeConge() {}

    public HistoriqueDemandeConge(DemandeConge demandeConge, StatutDemandeConge statut, String commentaire) {
        this.demandeConge = demandeConge;
        this.statut = statut;
        this.dateChangement = LocalDateTime.now();
        this.commentaire = commentaire;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public DemandeConge getDemandeConge() {
        return demandeConge;
    }

    public void setDemandeConge(DemandeConge demandeConge) {
        this.demandeConge = demandeConge;
    }

    public StatutDemandeConge getStatut() {
        return statut;
    }

    public void setStatut(StatutDemandeConge statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateChangement() {
        return dateChangement;
    }

    public void setDateChangement(LocalDateTime dateChangement) {
        this.dateChangement = dateChangement;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }
}
