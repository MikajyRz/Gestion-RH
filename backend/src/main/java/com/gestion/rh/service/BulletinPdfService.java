package com.gestion.rh.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.gestion.rh.model.BulletinPaie;
import com.gestion.rh.model.Employe;
import com.gestion.rh.model.LigneBulletinPaie;
import com.gestion.rh.repository.LigneBulletinPaieRepository;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class BulletinPdfService {

    private final LigneBulletinPaieRepository ligneBulletinPaieRepository;

    public BulletinPdfService(LigneBulletinPaieRepository ligneBulletinPaieRepository) {
        this.ligneBulletinPaieRepository = ligneBulletinPaieRepository;
    }

    private String formatMoney(BigDecimal amount) {
        if (amount == null) return "0,00";
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.FRANCE);
        symbols.setGroupingSeparator(' ');
        symbols.setDecimalSeparator(',');
        DecimalFormat formatter = new DecimalFormat("#,##0.00", symbols);
        return formatter.format(amount);
    }

    public File genererBulletinPdf(BulletinPaie bulletin) throws Exception {
        if (bulletin == null) {
            throw new IllegalArgumentException("Le bulletin de paie ne peut pas être null.");
        }

        String uploadDir = "uploads/paie";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        Employe emp = bulletin.getEmploye();
        String nomEmploye = (emp != null && emp.getNom() != null) ? emp.getNom().replaceAll("\\s+", "_").toLowerCase() : "employe";
        int mois = bulletin.getMois() != null ? bulletin.getMois() : 1;
        int annee = bulletin.getAnnee() != null ? bulletin.getAnnee() : 2026;

        String nomFichier = String.format("bulletin_%s_%02d_%d.pdf", nomEmploye, mois, annee);
        File pdfFile = new File(dir, nomFichier);

        Document document = new Document(PageSize.A4, 30, 30, 30, 30);
        OutputStream os = new FileOutputStream(pdfFile);
        PdfWriter.getInstance(document, os);

        document.open();

        Font fontHeaderTitle = new Font(Font.HELVETICA, 14, Font.BOLD, Color.BLACK);
        Font fontSubtitle = new Font(Font.HELVETICA, 12, Font.BOLD, Color.BLACK);
        Font fontBold = new Font(Font.HELVETICA, 9, Font.BOLD, Color.BLACK);
        Font fontNormal = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.BLACK);
        Font fontBlueBold = new Font(Font.HELVETICA, 10, Font.BOLD, new Color(0, 102, 204));
        Font fontCyanBox = new Font(Font.HELVETICA, 10, Font.BOLD, new Color(0, 153, 204));

        // 1. Titre FICHE DE PAIE
        LocalDate dernierJourDuMois = LocalDate.of(annee, mois, 1).plusMonths(1).minusDays(1);
        String dateArrete = dernierJourDuMois.format(DateTimeFormatter.ofPattern("dd/MM/yy"));

        Paragraph title = new Paragraph("FICHE DE PAIE", fontHeaderTitle);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Paragraph subtitle = new Paragraph("ARRETE AU " + dateArrete, fontSubtitle);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(15);
        document.add(subtitle);

        // 2. Bloc Informations Employé & Taux (Tableau 2 colonnes)
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{60, 40});

        String prenom = (emp != null && emp.getPrenom() != null) ? emp.getPrenom() : "";
        String nom = (emp != null && emp.getNom() != null) ? emp.getNom() : "";
        String matricule = (emp != null && emp.getMatricule() != null) ? emp.getMatricule() : "627/TNR";
        String fonction = (emp != null && emp.getDepartement() != null && emp.getDepartement().getNom() != null) ? emp.getDepartement().getNom() : "DRH";
        String cnaps = (emp != null && emp.getNumeroCnaps() != null) ? emp.getNumeroCnaps() : "345670000";
        String dateEmbauche = (emp != null && emp.getDateDembauche() != null) ? emp.getDateDembauche().toString() : "25/03/2011";

        PdfPCell cellLeft = new PdfPCell();
        cellLeft.setBorder(PdfPCell.NO_BORDER);
        cellLeft.addElement(new Paragraph("Nom et Prénoms : " + prenom + " " + nom, fontBold));
        cellLeft.addElement(new Paragraph("Matricule : " + matricule, fontNormal));
        cellLeft.addElement(new Paragraph("Fonction : " + fonction, fontNormal));
        cellLeft.addElement(new Paragraph("N° CNaPS : " + cnaps, fontNormal));
        cellLeft.addElement(new Paragraph("Date d'embauche : " + dateEmbauche, fontNormal));
        cellLeft.addElement(new Paragraph("Ancienneté : 14 an(s) 7 mois et 12 jour(s)", fontNormal));
        infoTable.addCell(cellLeft);

        PdfPCell cellRight = new PdfPCell();
        cellRight.setBorder(PdfPCell.NO_BORDER);
        cellRight.addElement(new Paragraph("Classification : HC", fontNormal));
        cellRight.addElement(new Paragraph("Salaire de base : " + formatMoney(bulletin.getSalaireBase()) + " Ar", fontCyanBox));
        cellRight.addElement(new Paragraph("Taux journaliers : " + formatMoney(bulletin.getTauxJournalier()), fontNormal));
        cellRight.addElement(new Paragraph("Taux horaires : " + formatMoney(bulletin.getTauxHoraire()), fontNormal));
        cellRight.addElement(new Paragraph("Indice : 33 734,00", fontNormal));
        infoTable.addCell(cellRight);

        document.add(infoTable);

        Paragraph space = new Paragraph(" ", fontNormal);
        space.setSpacingAfter(10);
        document.add(space);

        // 3. Tableau des Désignations (Gains & Bruts)
        PdfPTable tableGains = new PdfPTable(4);
        tableGains.setWidthPercentage(100);
        tableGains.setWidths(new float[]{55, 15, 15, 15});

        tableGains.addCell(createCell("Désignations", fontBold, Element.ALIGN_CENTER, true));
        tableGains.addCell(createCell("Nombre", fontBold, Element.ALIGN_CENTER, true));
        tableGains.addCell(createCell("Taux", fontBold, Element.ALIGN_CENTER, true));
        tableGains.addCell(createCell("Montant", fontBold, Element.ALIGN_CENTER, true));

        List<LigneBulletinPaie> lignes = ligneBulletinPaieRepository.findByBulletinPaieId(bulletin.getId());

        if (lignes != null) {
            for (LigneBulletinPaie l : lignes) {
                if ("GAIN".equals(l.getTypeLigne()) || "BASE".equals(l.getCodeRubrique())) {
                    tableGains.addCell(createCell(l.getLibelle(), fontNormal, Element.ALIGN_LEFT, false));
                    tableGains.addCell(createCell(l.getNombreUnite() != null ? l.getNombreUnite().toString() + " mois" : "", fontNormal, Element.ALIGN_CENTER, false));
                    tableGains.addCell(createCell(l.getBaseCalcul() != null ? formatMoney(l.getBaseCalcul()) : "", fontNormal, Element.ALIGN_RIGHT, false));
                    tableGains.addCell(createCell(formatMoney(l.getMontantGain()), fontNormal, Element.ALIGN_RIGHT, false));
                }
            }
        }

        // Ligne Total Salaire Brut
        PdfPCell cellBrutLabel = createCell("Salaire brut", fontHeaderTitle, Element.ALIGN_RIGHT, false);
        cellBrutLabel.setColspan(3);
        tableGains.addCell(cellBrutLabel);
        tableGains.addCell(createCell(formatMoney(bulletin.getSalaireBrut()), fontHeaderTitle, Element.ALIGN_RIGHT, false));

        document.add(tableGains);
        document.add(space);

        // 4. Tableau des Retenues & IRSA
        PdfPTable tableRetenues = new PdfPTable(3);
        tableRetenues.setWidthPercentage(100);
        tableRetenues.setWidths(new float[]{60, 20, 20});

        tableRetenues.addCell(createCell("Retenue CNaPS 1%", fontNormal, Element.ALIGN_LEFT, false));
        tableRetenues.addCell(createCell("", fontNormal, Element.ALIGN_CENTER, false));
        tableRetenues.addCell(createCell(formatMoney(bulletin.getCnapsSalarie()), fontNormal, Element.ALIGN_RIGHT, false));

        tableRetenues.addCell(createCell("Retenue sanitaire (OSTIE)", fontNormal, Element.ALIGN_LEFT, false));
        tableRetenues.addCell(createCell("", fontNormal, Element.ALIGN_CENTER, false));
        tableRetenues.addCell(createCell(formatMoney(bulletin.getOstieSalarie()), fontNormal, Element.ALIGN_RIGHT, false));

        // Décomposition IRSA dynamique par tranches légales
        BigDecimal imposable = bulletin.getSalaireImposable() != null ? bulletin.getSalaireImposable() : BigDecimal.ZERO;
        double s = imposable.doubleValue();

        double t5 = (s > 350000) ? (Math.min(s, 400000) - 350000) * 0.05 : 0.0;
        double t10 = (s > 400000) ? (Math.min(s, 500000) - 400000) * 0.10 : 0.0;
        double t15 = (s > 500000) ? (Math.min(s, 600000) - 500000) * 0.15 : 0.0;
        double t20 = (s > 600000) ? (Math.min(s, 4000000) - 600000) * 0.20 : 0.0;
        double t25 = (s > 4000000) ? (s - 4000000) * 0.25 : 0.0;

        tableRetenues.addCell(createCell("Tranche IRSA INF 350 000", fontNormal, Element.ALIGN_LEFT, false));
        tableRetenues.addCell(createCell("0%", fontNormal, Element.ALIGN_CENTER, false));
        tableRetenues.addCell(createCell("0,00", fontNormal, Element.ALIGN_RIGHT, false));

        tableRetenues.addCell(createCell("Tranche IRSA DE 350 001 à 400 000", fontNormal, Element.ALIGN_LEFT, false));
        tableRetenues.addCell(createCell("5%", fontNormal, Element.ALIGN_CENTER, false));
        tableRetenues.addCell(createCell(formatMoney(new BigDecimal(t5).setScale(2, java.math.RoundingMode.HALF_UP)), fontNormal, Element.ALIGN_RIGHT, false));

        tableRetenues.addCell(createCell("Tranche IRSA DE 400 001 à 500 000", fontNormal, Element.ALIGN_LEFT, false));
        tableRetenues.addCell(createCell("10%", fontNormal, Element.ALIGN_CENTER, false));
        tableRetenues.addCell(createCell(formatMoney(new BigDecimal(t10).setScale(2, java.math.RoundingMode.HALF_UP)), fontNormal, Element.ALIGN_RIGHT, false));

        tableRetenues.addCell(createCell("Tranche IRSA DE 500 001 à 600 000", fontNormal, Element.ALIGN_LEFT, false));
        tableRetenues.addCell(createCell("15%", fontNormal, Element.ALIGN_CENTER, false));
        tableRetenues.addCell(createCell(formatMoney(new BigDecimal(t15).setScale(2, java.math.RoundingMode.HALF_UP)), fontNormal, Element.ALIGN_RIGHT, false));

        tableRetenues.addCell(createCell("Tranche IRSA DE 600 001 à 4 000 000", fontNormal, Element.ALIGN_LEFT, false));
        tableRetenues.addCell(createCell("20%", fontNormal, Element.ALIGN_CENTER, false));
        tableRetenues.addCell(createCell(formatMoney(new BigDecimal(t20).setScale(2, java.math.RoundingMode.HALF_UP)), fontNormal, Element.ALIGN_RIGHT, false));

        tableRetenues.addCell(createCell("Tranche IRSA PLUS DE 4 000 000", fontNormal, Element.ALIGN_LEFT, false));
        tableRetenues.addCell(createCell("25%", fontNormal, Element.ALIGN_CENTER, false));
        tableRetenues.addCell(createCell(formatMoney(new BigDecimal(t25).setScale(2, java.math.RoundingMode.HALF_UP)), fontNormal, Element.ALIGN_RIGHT, false));

        // TOTAL IRSA
        BigDecimal totalIrsa = bulletin.getTotalIrsa() != null ? bulletin.getTotalIrsa() : BigDecimal.ZERO;
        PdfPCell cellIrsaLabel = createCell("TOTAL IRSA", fontHeaderTitle, Element.ALIGN_RIGHT, false);
        cellIrsaLabel.setColspan(2);
        tableRetenues.addCell(cellIrsaLabel);
        tableRetenues.addCell(createCell(formatMoney(totalIrsa), fontHeaderTitle, Element.ALIGN_RIGHT, false));

        // Total des retenues
        PdfPCell cellRetenuesLabel = createCell("Total des retenues", fontHeaderTitle, Element.ALIGN_RIGHT, false);
        cellRetenuesLabel.setColspan(2);
        tableRetenues.addCell(cellRetenuesLabel);
        tableRetenues.addCell(createCell(formatMoney(bulletin.getTotalRetenues()), fontHeaderTitle, Element.ALIGN_RIGHT, false));

        // Net à payer
        PdfPCell cellNetLabel = createCell("Net à payer", fontHeaderTitle, Element.ALIGN_RIGHT, false);
        cellNetLabel.setColspan(2);
        tableRetenues.addCell(cellNetLabel);
        tableRetenues.addCell(createCell(formatMoney(bulletin.getSalaireNet()) + " Ar", fontHeaderTitle, Element.ALIGN_RIGHT, false));

        document.add(tableRetenues);
        document.add(space);

        // 5. Pied de page & Signatures
        PdfPTable footerTable = new PdfPTable(2);
        footerTable.setWidthPercentage(100);
        footerTable.setWidths(new float[]{50, 50});

        String modePaiement = bulletin.getModePaiement() != null ? bulletin.getModePaiement() : "Virement/chèque";

        PdfPCell footerLeft = new PdfPCell();
        footerLeft.setBorder(PdfPCell.NO_BORDER);
        footerLeft.addElement(new Paragraph("Avantages en nature : ", fontNormal));
        footerLeft.addElement(new Paragraph("Déductions IRSA : ", fontNormal));
        footerLeft.addElement(new Paragraph("Montant imposable : " + formatMoney(bulletin.getSalaireImposable()), fontBold));
        footerLeft.addElement(new Paragraph("Mode de paiement : " + modePaiement, fontBlueBold));
        footerLeft.addElement(new Paragraph(" ", fontNormal));
        footerLeft.addElement(new Paragraph("L'employeur", fontBold));
        footerTable.addCell(footerLeft);

        PdfPCell footerRight = new PdfPCell();
        footerRight.setBorder(PdfPCell.NO_BORDER);
        footerRight.addElement(new Paragraph(" ", fontNormal));
        footerRight.addElement(new Paragraph(" ", fontNormal));
        footerRight.addElement(new Paragraph(" ", fontNormal));
        footerRight.addElement(new Paragraph(" ", fontNormal));
        footerRight.addElement(new Paragraph(" ", fontNormal));
        footerRight.addElement(new Paragraph("L'employé(e)", fontBold));
        footerTable.addCell(footerRight);

        document.add(footerTable);

        document.close();
        os.close();

        return pdfFile;
    }

    private PdfPCell createCell(String text, Font font, int alignment, boolean isHeader) {
        PdfPCell cell = new PdfPCell(new Paragraph(text != null ? text : "", font));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(4);
        if (isHeader) {
            cell.setBackgroundColor(new Color(240, 240, 240));
        }
        return cell;
    }
}
