import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ScoreSpecialite, specialitesInfo } from '@/types/questionnaire';

// Fonction helper pour retirer les emojis d'une chaîne
function removeEmojis(text: string): string {
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
}

// Fonction helper pour convertir emoji en texte descriptif
function emojiToText(emoji: string): string {
  const emojiMap: { [key: string]: string } = {
    '📐': '[Maths]',
    '⚛️': '[Physique]',
    '🧬': '[SVT]',
    '📊': '[SES]',
    '💻': '[NSI]',
    '🌍': '[HGSP]',
    '📚': '[HLP]',
    '🌐': '[LLCE]',
    '🥇': '1.',
    '🥈': '2.',
    '🥉': '3.',
    '⭐': '*'
  };
  return emojiMap[emoji] || '';
}

export function genererPDFResultats(
  userName: string,
  userEmail: string,
  classe: string | null,
  topSpecialites: ScoreSpecialite[],
  scores: ScoreSpecialite[],
  explication: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(37, 99, 235); // bleu
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Chemins de Spe', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Resultats du Questionnaire d\'Orientation', pageWidth / 2, 28, { align: 'center' });
  
  // Infos élève
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  let yPos = 50;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Informations:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  
  doc.text(`Nom: ${userName}`, 14, yPos);
  yPos += 6;
  doc.text(`Email: ${userEmail}`, 14, yPos);
  yPos += 6;
  if (classe) {
    doc.text(`Classe: ${classe}`, 14, yPos);
    yPos += 6;
  }
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, yPos);
  yPos += 12;
  
  // Explication personnalisée
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('>> Ton Profil', 14, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const cleanExplication = removeEmojis(explication);
  const splitExplication = doc.splitTextToSize(cleanExplication, pageWidth - 28);
  doc.text(splitExplication, 14, yPos);
  yPos += (splitExplication.length * 5) + 10;
  
  // Top spécialités recommandées
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('>> Tes Specialites Recommandees', 14, yPos);
  yPos += 8;
  
  const topTableData = topSpecialites.map((spec, index) => {
    const info = specialitesInfo[spec.specialite];
    let medal = '*';
    if (index === 0) medal = '1.';
    else if (index === 1) medal = '2.';
    else if (index === 2) medal = '3.';
    
    return [
      `${medal} ${spec.specialite}`,
      `${spec.pourcentage}%`,
      removeEmojis(info.description || '')
    ];
  });
  
  autoTable(doc, {
    startY: yPos,
    head: [['Specialite', 'Score', 'Description']],
    body: topTableData,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: 14, right: 14 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Vérifier si on doit ajouter une nouvelle page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }
  
  // Tous les scores
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('>> Tous tes Scores', 14, yPos);
  yPos += 8;
  
  const scoresTableData = scores.map((score) => {
    const info = specialitesInfo[score.specialite];
    return [
      `${emojiToText(info.emoji)} ${score.specialite}`,
      `${score.pourcentage}%`
    ];
  });
  
  autoTable(doc, {
    startY: yPos,
    head: [['Specialite', 'Compatibilite']],
    body: scoresTableData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: 14, right: 14 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Perspectives d'avenir pour les top spécialités
  topSpecialites.slice(0, 3).forEach((spec, index) => {
    const info = specialitesInfo[spec.specialite];
    
    // Nouvelle page si nécessaire
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${emojiToText(info.emoji)} ${spec.specialite} - Perspectives`, 14, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    // Métiers
    doc.setFont('helvetica', 'bold');
    doc.text('Metiers possibles:', 14, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    info.metiers.forEach((metier: string) => {
      const cleanMetier = removeEmojis(metier);
      doc.text(`- ${cleanMetier}`, 18, yPos);
      yPos += 4;
    });
    yPos += 2;
    
    // Études
    doc.setFont('helvetica', 'bold');
    doc.text('Etudes post-bac:', 14, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    info.etudes.forEach((etude: string) => {
      const cleanEtude = removeEmojis(etude);
      doc.text(`- ${cleanEtude}`, 18, yPos);
      yPos += 4;
    });
    yPos += 10;
  });
  
  // Footer sur toutes les pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Chemins de Spe - Résultat de ton Orientation - Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Télécharger le PDF
  const filename = `resultats_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
