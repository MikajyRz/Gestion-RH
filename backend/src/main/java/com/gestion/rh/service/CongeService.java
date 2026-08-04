package com.gestion.rh.service;

import com.gestion.rh.model.*;
import com.gestion.rh.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CongeService {

    private final TypeCongeRepository typeCongeRepository;
    private final StatutDemandeCongeRepository statutDemandeCongeRepository;
    private final SoldeCongeRepository soldeCongeRepository;
    private final JourFerieRepository jourFerieRepository;
    private final DemandeCongeRepository demandeCongeRepository;
    private final HistoriqueDemandeCongeRepository historiqueDemandeCongeRepository;
    private final EmployeRepository employeRepository;

    public CongeService(TypeCongeRepository typeCongeRepository,
                        StatutDemandeCongeRepository statutDemandeCongeRepository,
                        SoldeCongeRepository soldeCongeRepository,
                        JourFerieRepository jourFerieRepository,
                        DemandeCongeRepository demandeCongeRepository,
                        HistoriqueDemandeCongeRepository historiqueDemandeCongeRepository,
                        EmployeRepository employeRepository) {
        this.typeCongeRepository = typeCongeRepository;
        this.statutDemandeCongeRepository = statutDemandeCongeRepository;
        this.soldeCongeRepository = soldeCongeRepository;
        this.jourFerieRepository = jourFerieRepository;
        this.demandeCongeRepository = demandeCongeRepository;
        this.historiqueDemandeCongeRepository = historiqueDemandeCongeRepository;
        this.employeRepository = employeRepository;
    }

    /**
     * Calcule le nombre de jours ouvrés entre deux dates (hors samedis, dimanches et jours fériés).
     */
    public int calculerJoursOuvres(LocalDate debut, LocalDate fin) {
        if (debut == null || fin == null || debut.isAfter(fin)) {
            return 0;
        }

        List<JourFerie> joursFeriesList = jourFerieRepository.findByDateFerieBetween(debut, fin);
        Set<LocalDate> datesFeries = joursFeriesList.stream()
                .map(JourFerie::getDateFerie)
                .collect(Collectors.toSet());

        int count = 0;
        LocalDate curr = debut;
        while (!curr.isAfter(fin)) {
            DayOfWeek dow = curr.getDayOfWeek();
            boolean isWeekend = (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY);
            boolean isFerie = datesFeries.contains(curr);

            if (!isWeekend && !isFerie) {
                count++;
            }
            curr = curr.plusDays(1);
        }
        return count;
    }

    /**
     * Récupère ou initialise le solde d'un employé pour une année et un type de congé donné.
     */
    public SoldeConge getOrInitialiserSolde(Employe employe, TypeConge typeConge, int annee) {
        Optional<SoldeConge> soldeOpt = soldeCongeRepository.findByEmployeIdAndTypeCongeIdAndAnnee(
                employe.getId(), typeConge.getId(), annee);

        if (soldeOpt.isPresent()) {
            return soldeOpt.get();
        }

        // Attribution d'un solde par défaut si inexistant (ex: 30 jours par an pour congé payé)
        BigDecimal soldeParDefaut = BigDecimal.valueOf(30);
        if (typeConge.getLibelle().toLowerCase().contains("maladie")) {
            soldeParDefaut = BigDecimal.valueOf(15);
        } else if (typeConge.getLibelle().toLowerCase().contains("événement") || typeConge.getLibelle().toLowerCase().contains("evenement")) {
            soldeParDefaut = BigDecimal.valueOf(10);
        } else if (Boolean.FALSE.equals(typeConge.getEstRemunere())) {
            soldeParDefaut = BigDecimal.valueOf(90);
        }

        SoldeConge nouveauSolde = new SoldeConge(employe, typeConge, annee, soldeParDefaut);
        return soldeCongeRepository.save(nouveauSolde);
    }

    /**
     * Soumet une nouvelle demande de congé.
     */
    @Transactional
    public DemandeConge creerDemandeConge(Long idEmploye, Integer idTypeConge, LocalDate dateDebut, LocalDate dateFin, String motif) {
        Employe employe = employeRepository.findById(idEmploye)
                .orElseThrow(() -> new IllegalArgumentException("Employé introuvable ID: " + idEmploye));

        TypeConge typeConge = typeCongeRepository.findById(idTypeConge)
                .orElseThrow(() -> new IllegalArgumentException("Type de congé introuvable ID: " + idTypeConge));

        if (dateDebut == null || dateFin == null || dateDebut.isAfter(dateFin)) {
            throw new IllegalArgumentException("La date de début doit être antérieure ou égale à la date de fin.");
        }

        int nombreJours = calculerJoursOuvres(dateDebut, dateFin);
        if (nombreJours <= 0) {
            throw new IllegalArgumentException("La période sélectionnée ne comporte aucun jour ouvré travaillé.");
        }

        int annee = dateDebut.getYear();
        SoldeConge solde = getOrInitialiserSolde(employe, typeConge, annee);

        // Vérification du solde si le congé est rémunéré
        if (Boolean.TRUE.equals(typeConge.getEstRemunere()) 
                && solde.getJoursRestants().compareTo(BigDecimal.valueOf(nombreJours)) < 0) {
            throw new IllegalArgumentException("Solde de congé insuffisant ! Jours restants : " 
                    + solde.getJoursRestants() + " jour(s), Jours demandés : " + nombreJours + " jour(s).");
        }

        StatutDemandeConge stEnAttente = statutDemandeCongeRepository.findByCode("EN_ATTENTE")
                .orElseGet(() -> statutDemandeCongeRepository.save(new StatutDemandeConge("EN_ATTENTE", "En attente de validation RH")));

        DemandeConge demande = new DemandeConge();
        demande.setEmploye(employe);
        demande.setTypeConge(typeConge);
        demande.setDateDebut(dateDebut);
        demande.setDateFin(dateFin);
        demande.setNombreJours(nombreJours);
        demande.setMotif(motif);
        demande.setStatut(stEnAttente);

        DemandeConge saved = demandeCongeRepository.save(demande);

        // Historique
        historiqueDemandeCongeRepository.save(new HistoriqueDemandeConge(saved, stEnAttente, "Demande de congé enregistrée par l'employé."));

        return saved;
    }

    /**
     * Approbation RH d'une demande de congé.
     */
    @Transactional
    public DemandeConge approuverDemandeConge(Integer idDemande, Long idValidateurRh) {
        DemandeConge demande = demandeCongeRepository.findById(idDemande)
                .orElseThrow(() -> new IllegalArgumentException("Demande de congé introuvable ID: " + idDemande));

        StatutDemandeConge stApprouve = statutDemandeCongeRepository.findByCode("APPROUVE")
                .orElseGet(() -> statutDemandeCongeRepository.save(new StatutDemandeConge("APPROUVE", "Approuvé par RH")));

        demande.setStatut(stApprouve);

        if (idValidateurRh != null) {
            employeRepository.findById(idValidateurRh).ifPresent(demande::setValidateurRh);
        }

        // Mise à jour automatique du solde
        int annee = demande.getDateDebut().getYear();
        SoldeConge solde = getOrInitialiserSolde(demande.getEmploye(), demande.getTypeConge(), annee);

        BigDecimal joursDemandeDecimal = BigDecimal.valueOf(demande.getNombreJours());
        BigDecimal nouveauPris = solde.getJoursPris().add(joursDemandeDecimal);
        solde.setJoursPris(nouveauPris);
        solde.setJoursRestants(solde.getJoursAcquis().subtract(nouveauPris));

        soldeCongeRepository.save(solde);
        DemandeConge saved = demandeCongeRepository.save(demande);

        historiqueDemandeCongeRepository.save(new HistoriqueDemandeConge(saved, stApprouve, "Demande approuvée par le service RH."));

        return saved;
    }

    /**
     * Refus RH d'une demande de congé.
     */
    @Transactional
    public DemandeConge refuserDemandeConge(Integer idDemande, Long idValidateurRh, String commentaireRefus) {
        DemandeConge demande = demandeCongeRepository.findById(idDemande)
                .orElseThrow(() -> new IllegalArgumentException("Demande de congé introuvable ID: " + idDemande));

        StatutDemandeConge stRefuse = statutDemandeCongeRepository.findByCode("REFUSE")
                .orElseGet(() -> statutDemandeCongeRepository.save(new StatutDemandeConge("REFUSE", "Refusé par RH")));

        demande.setStatut(stRefuse);
        demande.setCommentaireRefus(commentaireRefus);

        if (idValidateurRh != null) {
            employeRepository.findById(idValidateurRh).ifPresent(demande::setValidateurRh);
        }

        DemandeConge saved = demandeCongeRepository.save(demande);

        historiqueDemandeCongeRepository.save(new HistoriqueDemandeConge(saved, stRefuse, "Demande refusée par RH : " + commentaireRefus));

        return saved;
    }
}
