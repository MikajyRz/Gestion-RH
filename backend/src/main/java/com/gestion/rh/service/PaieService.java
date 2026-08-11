package com.gestion.rh.service;

import com.gestion.rh.model.*;
import com.gestion.rh.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PaieService {

    private final BulletinPaieRepository bulletinPaieRepository;
    private final LigneBulletinPaieRepository ligneBulletinPaieRepository;
    private final FeuilleTempsRepository feuilleTempsRepository;
    private final StatutBulletinRepository statutBulletinRepository;
    private final EmployeRepository employeRepository;
    private final ContratRepository contratRepository;
    private final ParametreCotisationRepository parametreCotisationRepository;

    public PaieService(BulletinPaieRepository bulletinPaieRepository,
                       LigneBulletinPaieRepository ligneBulletinPaieRepository,
                       FeuilleTempsRepository feuilleTempsRepository,
                       StatutBulletinRepository statutBulletinRepository,
                       EmployeRepository employeRepository,
                       ContratRepository contratRepository,
                       ParametreCotisationRepository parametreCotisationRepository) {
        this.bulletinPaieRepository = bulletinPaieRepository;
        this.ligneBulletinPaieRepository = ligneBulletinPaieRepository;
        this.feuilleTempsRepository = feuilleTempsRepository;
        this.statutBulletinRepository = statutBulletinRepository;
        this.employeRepository = employeRepository;
        this.contratRepository = contratRepository;
        this.parametreCotisationRepository = parametreCotisationRepository;
    }

    /**
     * Calcule le montant de l'IRSA selon le barème progressif officiel malgache.
     */
    public BigDecimal calculerIrsa(BigDecimal salaireImposable) {
        if (salaireImposable == null || salaireImposable.compareTo(new BigDecimal("350000")) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        double impot = 0.0;
        double montant = salaireImposable.doubleValue();

        // Tranche 5% : De 350 001 à 400 000
        if (montant > 350000) {
            double base = Math.min(montant, 400000) - 350000;
            impot += base * 0.05;
        }

        // Tranche 10% : De 400 001 à 500 000
        if (montant > 400000) {
            double base = Math.min(montant, 500000) - 400000;
            impot += base * 0.10;
        }

        // Tranche 15% : De 500 001 à 600 000
        if (montant > 500000) {
            double base = Math.min(montant, 600000) - 500000;
            impot += base * 0.15;
        }

        // Tranche 20% : De 600 001 à 4 000 000
        if (montant > 600000) {
            double base = Math.min(montant, 4000000) - 600000;
            impot += base * 0.20;
        }

        // Tranche 25% : Plus de 4 000 000
        if (montant > 4000000) {
            double base = montant - 4000000;
            impot += base * 0.25;
        }

        return new BigDecimal(impot).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Génère ou recalcule le bulletin de paie d'un employé pour un mois donné.
     */
    @Transactional
    public BulletinPaie calculerBulletinEmploye(Long idEmploye, Integer mois, Integer annee) {
        Employe employe = employeRepository.findById(idEmploye)
                .orElseThrow(() -> new IllegalArgumentException("Employé introuvable id=" + idEmploye));

        // Récupérer le salaire de base depuis le contrat ou valeur par défaut
        BigDecimal salaireBase = new BigDecimal("350000.00");
        List<Contrat> contrats = contratRepository.findByEmployeId(idEmploye);
        if (!contrats.isEmpty()) {
            Contrat contratActif = contrats.get(contrats.size() - 1);
            if (contratActif.getSalaire() != null && contratActif.getSalaire().compareTo(BigDecimal.ZERO) > 0) {
                salaireBase = contratActif.getSalaire();
            }
        }

        // Calculs des taux journalier et horaire
        BigDecimal tauxJournalier = salaireBase.divide(new BigDecimal("30"), 2, RoundingMode.HALF_UP);
        BigDecimal tauxHoraire = salaireBase.divide(new BigDecimal("173.33"), 2, RoundingMode.HALF_UP);

        // Récupérer la feuille de temps si elle existe
        Optional<FeuilleTemps> ftOpt = feuilleTempsRepository.findByEmployeIdAndMoisAndAnnee(idEmploye, mois, annee);
        BigDecimal hs30 = ftOpt.map(FeuilleTemps::getHeuresSup30).orElse(BigDecimal.ZERO);
        BigDecimal hs40 = ftOpt.map(FeuilleTemps::getHeuresSup40).orElse(BigDecimal.ZERO);
        BigDecimal hs50 = ftOpt.map(FeuilleTemps::getHeuresSup50).orElse(BigDecimal.ZERO);
        BigDecimal hs100 = ftOpt.map(FeuilleTemps::getHeuresSup100).orElse(BigDecimal.ZERO);
        BigDecimal hsNuit = ftOpt.map(FeuilleTemps::getHeuresNuit).orElse(BigDecimal.ZERO);
        BigDecimal joursAbs = ftOpt.map(FeuilleTemps::getJoursAbsences).orElse(BigDecimal.ZERO);

        // Calculs des montants d'heures sup
        BigDecimal montantHs30 = hs30.multiply(tauxHoraire).multiply(new BigDecimal("1.30")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal montantHs40 = hs40.multiply(tauxHoraire).multiply(new BigDecimal("1.40")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal montantHs50 = hs50.multiply(tauxHoraire).multiply(new BigDecimal("1.50")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal montantHs100 = hs100.multiply(tauxHoraire).multiply(new BigDecimal("2.00")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal montantHsNuit = hsNuit.multiply(tauxHoraire).multiply(new BigDecimal("1.30")).setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalHeuresSup = montantHs30.add(montantHs40).add(montantHs50).add(montantHs100).add(montantHsNuit);

        // Déduction d'absences
        BigDecimal deductionAbsences = joursAbs.multiply(tauxJournalier).setScale(2, RoundingMode.HALF_UP);

        // Primes éventuelles
        BigDecimal totalPrimes = BigDecimal.ZERO;

        // Salaire Brut
        BigDecimal salaireBrut = salaireBase.add(totalHeuresSup).add(totalPrimes).subtract(deductionAbsences);
        if (salaireBrut.compareTo(BigDecimal.ZERO) < 0) salaireBrut = BigDecimal.ZERO;

        // Cotisations Sociales (CNaPS Salarié 1% plafonné à 2 800 000 Ar -> Max 28 000 Ar)
        BigDecimal plafondCnaps = new BigDecimal("2800000.00");
        BigDecimal baseCnaps = salaireBrut.min(plafondCnaps);
        BigDecimal cnapsSalarie = baseCnaps.multiply(new BigDecimal("0.01")).setScale(2, RoundingMode.HALF_UP);

        // OSTIE / Santé 1% (Sans plafond)
        BigDecimal ostieSalarie = salaireBrut.multiply(new BigDecimal("0.01")).setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalCotisations = cnapsSalarie.add(ostieSalarie);

        // Salaire Imposable & IRSA
        BigDecimal salaireImposable = salaireBrut.subtract(totalCotisations);
        if (salaireImposable.compareTo(BigDecimal.ZERO) < 0) salaireImposable = BigDecimal.ZERO;

        BigDecimal totalIrsa = calculerIrsa(salaireImposable);

        // Avances / Acomptes
        BigDecimal avanceAcompte = BigDecimal.ZERO;

        // Total Retenues
        BigDecimal totalRetenues = totalCotisations.add(totalIrsa).add(avanceAcompte);

        // Salaire Net à Payer
        BigDecimal salaireNet = salaireBrut.subtract(totalRetenues);
        if (salaireNet.compareTo(BigDecimal.ZERO) < 0) salaireNet = BigDecimal.ZERO;

        // Sauvegarder ou Mettre à jour l'en-tête Bulletin
        BulletinPaie bulletin = bulletinPaieRepository.findByEmployeIdAndMoisAndAnnee(idEmploye, mois, annee)
                .orElseGet(BulletinPaie::new);

        bulletin.setEmploye(employe);
        bulletin.setMois(mois);
        bulletin.setAnnee(annee);
        bulletin.setSalaireBase(salaireBase);
        bulletin.setTauxJournalier(tauxJournalier);
        bulletin.setTauxHoraire(tauxHoraire);
        bulletin.setTotalHeuresSup(totalHeuresSup);
        bulletin.setTotalPrimes(totalPrimes);
        bulletin.setDeductionAbsences(deductionAbsences);
        bulletin.setSalaireBrut(salaireBrut);
        bulletin.setCnapsSalarie(cnapsSalarie);
        bulletin.setOstieSalarie(ostieSalarie);
        bulletin.setTotalCotisations(totalCotisations);
        bulletin.setSalaireImposable(salaireImposable);
        bulletin.setTotalIrsa(totalIrsa);
        bulletin.setAvanceAcompte(avanceAcompte);
        bulletin.setTotalRetenues(totalRetenues);
        bulletin.setSalaireNet(salaireNet);

        if (bulletin.getStatut() == null) {
            StatutBulletin stBrouillon = statutBulletinRepository.findByCode("BROUILLON")
                    .orElseGet(() -> statutBulletinRepository.save(new StatutBulletin("BROUILLON", "Brouillon en cours de calcul")));
            bulletin.setStatut(stBrouillon);
        }

        bulletin = bulletinPaieRepository.save(bulletin);

        // Re-créer les lignes de détail pour l'export PDF
        ligneBulletinPaieRepository.deleteByBulletinPaieId(bulletin.getId());

        List<LigneBulletinPaie> lignes = new ArrayList<>();

        // 1. Ligne Salaire de base
        lignes.add(creerLigne(bulletin, "BASE", "Salaire du mois", "GAIN", new BigDecimal("1"), tauxJournalier, null, salaireBase, BigDecimal.ZERO));

        // 2. Absences si applicable
        if (joursAbs.compareTo(BigDecimal.ZERO) > 0) {
            lignes.add(creerLigne(bulletin, "ABS", "Absences déductibles", "RETENUE", joursAbs, tauxJournalier, null, BigDecimal.ZERO, deductionAbsences));
        }

        // 3. Heures Sup
        if (hs30.compareTo(BigDecimal.ZERO) > 0) {
            lignes.add(creerLigne(bulletin, "HS30", "Heures supplémentaires majorées de 30%", "GAIN", hs30, tauxHoraire, new BigDecimal("130"), montantHs30, BigDecimal.ZERO));
        }
        if (hs40.compareTo(BigDecimal.ZERO) > 0) {
            lignes.add(creerLigne(bulletin, "HS40", "Heures supplémentaires majorées de 40%", "GAIN", hs40, tauxHoraire, new BigDecimal("140"), montantHs40, BigDecimal.ZERO));
        }
        if (hs50.compareTo(BigDecimal.ZERO) > 0) {
            lignes.add(creerLigne(bulletin, "HS50", "Heures supplémentaires majorées de 50%", "GAIN", hs50, tauxHoraire, new BigDecimal("150"), montantHs50, BigDecimal.ZERO));
        }
        if (hs100.compareTo(BigDecimal.ZERO) > 0) {
            lignes.add(creerLigne(bulletin, "HS100", "Heures supplémentaires majorées de 100%", "GAIN", hs100, tauxHoraire, new BigDecimal("200"), montantHs100, BigDecimal.ZERO));
        }
        if (hsNuit.compareTo(BigDecimal.ZERO) > 0) {
            lignes.add(creerLigne(bulletin, "HSNUIT", "Majoration pour heures de nuit", "GAIN", hsNuit, tauxHoraire, new BigDecimal("130"), montantHsNuit, BigDecimal.ZERO));
        }

        // 4. Cotisations Sociales
        lignes.add(creerLigne(bulletin, "CNAPS", "Retenue CNaPS 1%", "RETENUE", null, baseCnaps, new BigDecimal("1.00"), BigDecimal.ZERO, cnapsSalarie));
        lignes.add(creerLigne(bulletin, "OSTIE", "Retenue sanitaire (OSTIE 1%)", "RETENUE", null, salaireBrut, new BigDecimal("1.00"), BigDecimal.ZERO, ostieSalarie));

        // 5. Ligne IRSA
        lignes.add(creerLigne(bulletin, "IRSA", "Impôt sur les Revenus (IRSA)", "RETENUE", null, salaireImposable, null, BigDecimal.ZERO, totalIrsa));

        ligneBulletinPaieRepository.saveAll(lignes);

        return bulletin;
    }

    private LigneBulletinPaie creerLigne(BulletinPaie bulletin, String code, String libelle, String type,
                                         BigDecimal unite, BigDecimal base, BigDecimal taux,
                                         BigDecimal gain, BigDecimal retenue) {
        LigneBulletinPaie l = new LigneBulletinPaie();
        l.setBulletinPaie(bulletin);
        l.setCodeRubrique(code);
        l.setLibelle(libelle);
        l.setTypeLigne(type);
        l.setNombreUnite(unite);
        l.setBaseCalcul(base);
        l.setTauxPourcentage(taux);
        l.setMontantGain(gain != null ? gain : BigDecimal.ZERO);
        l.setMontantRetenue(retenue != null ? retenue : BigDecimal.ZERO);
        return l;
    }

    /**
     * Génère tous les bulletins des employés actifs pour un mois donné.
     */
    @Transactional
    public List<BulletinPaie> genererPaieDuMois(Integer mois, Integer annee) {
        List<Employe> employes = employeRepository.findAll();
        List<BulletinPaie> bulletins = new ArrayList<>();
        for (Employe e : employes) {
            bulletins.add(calculerBulletinEmploye(e.getId(), mois, annee));
        }
        return bulletins;
    }

    /**
     * Valide le bulletin de paie par les RH.
     */
    @Transactional
    public BulletinPaie validerBulletin(Long idBulletin, Long idValidateur) {
        BulletinPaie b = bulletinPaieRepository.findById(idBulletin)
                .orElseThrow(() -> new IllegalArgumentException("Bulletin introuvable id=" + idBulletin));

        StatutBulletin stValide = statutBulletinRepository.findByCode("VALIDE")
                .orElseGet(() -> statutBulletinRepository.save(new StatutBulletin("VALIDE", "Validé par la Direction RH")));
        b.setStatut(stValide);

        if (idValidateur != null) {
            employeRepository.findById(idValidateur).ifPresent(b::setValidateurRh);
        }

        return bulletinPaieRepository.save(b);
    }
}
