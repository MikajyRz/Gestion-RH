package com.gestion.rh.service;

import com.gestion.rh.model.Candidat;
import com.gestion.rh.model.OffreEmbauche;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class ContratPdfService {

    @Value("${app.upload.dir:uploads}")
    private String baseUploadDir;

    /**
     * Génère et sauvegarde le fichier PDF de contrat dans uploads/contrat/contrat(nomemploye).pdf
     * @return Le fichier File généré sur le disque.
     */
    public File genererEtSauvegarderContratPdf(Candidat candidat, OffreEmbauche offre) throws Exception {
        // Dossier cible : uploads/contrat/
        Path targetDir = Paths.get("uploads", "contrat");
        if (!Files.exists(targetDir)) {
            Files.createDirectories(targetDir);
        }

        String nomEmploye = ((candidat.getNom() != null ? candidat.getNom().trim() : "Employe")
                + (candidat.getPrenom() != null ? "_" + candidat.getPrenom().trim() : ""))
                .replaceAll("\\s+", "_");

        // Format exact demandé : contrat(nomemploye).pdf
        String fileName = "contrat(" + nomEmploye + ").pdf";
        Path filePath = targetDir.resolve(fileName);
        File pdfFile = filePath.toFile();

        Document document = new Document(PageSize.A4, 40, 40, 40, 40);
        PdfWriter.getInstance(document, new FileOutputStream(pdfFile));

        document.open();

        // Polices OpenPDF
        Font fontCompany = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Font.BOLD);
        Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Font.BOLD);
        Font fontSub = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.ITALIC);
        Font fontSection = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Font.BOLD);
        Font fontBody = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL);

        // 1. En-tête
        Paragraph company = new Paragraph("SOCIÉTÉ GESTION RH S.A.R.L", fontCompany);
        company.setAlignment(Element.ALIGN_CENTER);
        document.add(company);

        Paragraph title = new Paragraph("CONTRAT DE TRAVAIL", fontTitle);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingBefore(10);
        title.setSpacingAfter(5);
        document.add(title);

        Paragraph ref = new Paragraph("Référence Dossier RH : RH-EMB-" + String.format("%04d", candidat.getId()), fontSub);
        ref.setAlignment(Element.ALIGN_CENTER);
        ref.setSpacingAfter(20);
        document.add(ref);

        // 2. Parties
        Paragraph pPartiesHeader = new Paragraph("ENTRE LES SOUSSIGNÉS :", fontSection);
        pPartiesHeader.setSpacingAfter(5);
        document.add(pPartiesHeader);

        Paragraph pEmployeur = new Paragraph("1° La Société Gestion RH S.A.R.L, représentée par la Direction des Ressources Humaines, d'une part,", fontBody);
        pEmployeur.setSpacingAfter(5);
        document.add(pEmployeur);

        String email = candidat.getCompteCandidat() != null ? candidat.getCompteCandidat().getEmail() : "—";
        Paragraph pEmploye = new Paragraph("2° Et M./Mme " + candidat.getPrenom() + " " + candidat.getNom()
                + ", demeurant à : " + (candidat.getAdresse() != null ? candidat.getAdresse() : "Non spécifiée")
                + " (Email : " + email + "), d'autre part.", fontBody);
        pEmploye.setSpacingAfter(15);
        document.add(pEmploye);

        // 3. Article 1 : Engagement & Poste
        Paragraph art1Header = new Paragraph("ARTICLE 1 : ENGAGEMENT ET FONCTIONS", fontSection);
        art1Header.setSpacingAfter(5);
        document.add(art1Header);

        String poste = candidat.getAnnonce() != null ? candidat.getAnnonce().getNomposte() : "Collaborateur RH";
        String dept = (candidat.getAnnonce() != null && candidat.getAnnonce().getDepartement() != null) 
                ? candidat.getAnnonce().getDepartement().getNom() : "Général";

        Paragraph art1Text = new Paragraph("L'Employeur engage M./Mme " + candidat.getPrenom() + " " + candidat.getNom()
                + " en qualité de " + poste + " au sein du Département " + dept + ".", fontBody);
        art1Text.setSpacingAfter(15);
        document.add(art1Text);

        // 4. Article 2 : Date & Type de contrat
        Paragraph art2Header = new Paragraph("ARTICLE 2 : DATE D'EFFET ET TYPE DE CONTRAT", fontSection);
        art2Header.setSpacingAfter(5);
        document.add(art2Header);

        String dateDebutStr = (offre != null && offre.getDateDebut() != null) ? offre.getDateDebut().toString() : "A la date de signature";
        String typeContratStr = (offre != null && offre.getTypeContrat() != null) ? offre.getTypeContrat().getLibelle() : "Contrat de Travail (CDI)";
        String dureeStr = (offre != null && offre.getNombreMois() != null) ? (" d'une durée déterminée de " + offre.getNombreMois() + " mois") : "";

        Paragraph art2Text = new Paragraph("Le présent contrat prend effet le " + dateDebutStr + " sous le régime d'un " + typeContratStr + dureeStr + ".", fontBody);
        art2Text.setSpacingAfter(15);
        document.add(art2Text);

        // 5. Article 3 : Rémunération
        Paragraph art3Header = new Paragraph("ARTICLE 3 : RÉMUNÉRATION", fontSection);
        art3Header.setSpacingAfter(5);
        document.add(art3Header);

        String salaireStr = (offre != null && offre.getSalaire() != null) ? (offre.getSalaire().toString() + " MGA") : "2 500 000 MGA";
        Paragraph art3Text = new Paragraph("En contrepartie de l'accomplissement de ses fonctions, l'Employé(e) percevra une rémunération mensuelle brute de " + salaireStr + ".", fontBody);
        art3Text.setSpacingAfter(15);
        document.add(art3Text);

        // 6. Article 4 : Dispositions particulières
        if (offre != null && offre.getRemarques() != null && !offre.getRemarques().isBlank()) {
            Paragraph art4Header = new Paragraph("ARTICLE 4 : DISPOSITIONS PARTICULIÈRES", fontSection);
            art4Header.setSpacingAfter(5);
            document.add(art4Header);

            Paragraph art4Text = new Paragraph("\"" + offre.getRemarques() + "\"", fontBody);
            art4Text.setSpacingAfter(15);
            document.add(art4Text);
        }

        // 7. Bloc de Signatures
        PdfPTable tableSignatures = new PdfPTable(2);
        tableSignatures.setWidthPercentage(100);
        tableSignatures.setSpacingBefore(30);

        PdfPCell cell1 = new PdfPCell(new Paragraph("Pour l'Entreprise :\n\n\n(Signature & Cachet)", fontBody));
        cell1.setBorder(Rectangle.NO_BORDER);

        PdfPCell cell2 = new PdfPCell(new Paragraph("L'Employé(e) :\nLu et approuvé\n\n(Signature)", fontBody));
        cell2.setBorder(Rectangle.NO_BORDER);

        tableSignatures.addCell(cell1);
        tableSignatures.addCell(cell2);

        document.add(tableSignatures);

        document.close();

        return pdfFile;
    }
}
