/**
 * PDF Export Utility for Interview Results
 * 
 * Generates a professional PDF report of interview performance
 * using jsPDF library with proper formatting and layout
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFExportOptions {
  candidateName?: string;
  jobRole: string;
  date: Date;
  overallScore: number;
  scores: {
    technicalKnowledge: number;
    communicationSkills: number;
    problemSolving: number;
    professionalism: number;
    overallFit: number;
    confidence?: number;
    articulation?: number;
    responseDepth?: number;
  };
  communicationMetrics?: {
    clarity: number;
    pace: number;
    vocabulary: number;
    grammarAccuracy: number;
    fillerWords: number;
    structuredThinking: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  hiringPotential?: string;
  decision?: 'RECOMMEND' | 'MAYBE' | 'NOT_RECOMMEND';
}

export const generateInterviewPDF = (options: PDFExportOptions): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Colors
  const primaryColor: [number, number, number] = [59, 130, 246]; // Blue
  const successColor: [number, number, number] = [34, 197, 94]; // Green
  const warningColor: [number, number, number] = [234, 179, 8]; // Yellow
  const dangerColor: [number, number, number] = [239, 68, 68]; // Red

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Interview Performance Report', pageWidth / 2, 25, { align: 'center' });

  yPosition = 50;

  // Candidate Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Job Role: ${options.jobRole}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Date: ${options.date.toLocaleDateString()}`, 20, yPosition);
  yPosition += 7;
  if (options.candidateName) {
    doc.text(`Candidate: ${options.candidateName}`, 20, yPosition);
    yPosition += 7;
  }
  yPosition += 5;

  // Overall Score - Large Display
  checkPageBreak(40);
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(20, yPosition, pageWidth - 40, 35, 3, 3, 'F');
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Score', pageWidth / 2, yPosition + 12, { align: 'center' });
  
  const scoreColor = options.overallScore >= 80 ? successColor : 
                     options.overallScore >= 60 ? warningColor : dangerColor;
  doc.setTextColor(...scoreColor);
  doc.setFontSize(32);
  doc.text(`${options.overallScore}%`, pageWidth / 2, yPosition + 28, { align: 'center' });
  
  yPosition += 45;

  // Decision Badge
  if (options.decision) {
    checkPageBreak(15);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    const decisionText = options.decision === 'RECOMMEND' ? 'Strong Recommendation' :
                        options.decision === 'MAYBE' ? 'Conditional Recommendation' : 
                        'Not Recommended';
    const decisionColor = options.decision === 'RECOMMEND' ? successColor :
                         options.decision === 'MAYBE' ? warningColor : dangerColor;
    
    doc.setFillColor(...decisionColor);
    const textWidth = doc.getTextWidth(decisionText);
    const badgeX = (pageWidth - textWidth - 10) / 2;
    doc.roundedRect(badgeX, yPosition, textWidth + 10, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(decisionText, pageWidth / 2, yPosition + 7, { align: 'center' });
    yPosition += 20;
  }

  // Core Competencies Section
  checkPageBreak(60);
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Core Competencies', 20, yPosition);
  yPosition += 10;

  const coreScores = [
    ['Technical Knowledge', options.scores.technicalKnowledge],
    ['Communication Skills', options.scores.communicationSkills],
    ['Problem Solving', options.scores.problemSolving],
    ['Professionalism', options.scores.professionalism],
    ['Overall Fit', options.scores.overallFit],
  ];

  if (options.scores.confidence) coreScores.push(['Confidence', options.scores.confidence]);
  if (options.scores.articulation) coreScores.push(['Articulation', options.scores.articulation]);
  if (options.scores.responseDepth) coreScores.push(['Response Depth', options.scores.responseDepth]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Competency', 'Score', 'Rating']],
    body: coreScores.map(([name, score]) => {
      const numScore = typeof score === 'number' ? score : 0;
      return [
        name,
        `${numScore}%`,
        numScore >= 80 ? 'Excellent' : numScore >= 60 ? 'Good' : numScore >= 40 ? 'Fair' : 'Needs Improvement'
      ];
    }),
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 50, halign: 'center' }
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Communication Metrics
  if (options.communicationMetrics) {
    checkPageBreak(60);
    doc.setTextColor(...primaryColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Communication Analysis', 20, yPosition);
    yPosition += 10;

    const commMetrics = [
      ['Clarity', options.communicationMetrics.clarity],
      ['Speaking Pace', options.communicationMetrics.pace],
      ['Vocabulary', options.communicationMetrics.vocabulary],
      ['Grammar Accuracy', options.communicationMetrics.grammarAccuracy],
      ['Filler Words (lower is better)', options.communicationMetrics.fillerWords],
      ['Structured Thinking', options.communicationMetrics.structuredThinking],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Score']],
      body: commMetrics.map(([name, score]) => [name, `${score}%`]),
      theme: 'striped',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 50, halign: 'center' }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Strengths
  if (options.strengths.length > 0) {
    checkPageBreak(40);
    doc.setTextColor(...successColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('✓ Strengths', 20, yPosition);
    yPosition += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    options.strengths.forEach((strength, idx) => {
      checkPageBreak(10);
      const lines = doc.splitTextToSize(`${idx + 1}. ${strength}`, pageWidth - 50);
      doc.text(lines, 25, yPosition);
      yPosition += lines.length * 5 + 3;
    });
    yPosition += 5;
  }

  // Weaknesses
  if (options.weaknesses.length > 0) {
    checkPageBreak(40);
    doc.setTextColor(...dangerColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠ Areas for Improvement', 20, yPosition);
    yPosition += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    options.weaknesses.forEach((weakness, idx) => {
      checkPageBreak(10);
      const lines = doc.splitTextToSize(`${idx + 1}. ${weakness}`, pageWidth - 50);
      doc.text(lines, 25, yPosition);
      yPosition += lines.length * 5 + 3;
    });
    yPosition += 5;
  }

  // Recommendations
  if (options.recommendations.length > 0) {
    checkPageBreak(40);
    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('📋 Recommendations', 20, yPosition);
    yPosition += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    options.recommendations.forEach((rec, idx) => {
      checkPageBreak(10);
      const lines = doc.splitTextToSize(`${idx + 1}. ${rec}`, pageWidth - 50);
      doc.text(lines, 25, yPosition);
      yPosition += lines.length * 5 + 3;
    });
    yPosition += 5;
  }

  // Hiring Potential
  if (options.hiringPotential) {
    checkPageBreak(30);
    doc.setFillColor(239, 246, 255);
    const lines = doc.splitTextToSize(options.hiringPotential, pageWidth - 50);
    const boxHeight = lines.length * 5 + 15;
    doc.roundedRect(20, yPosition, pageWidth - 40, boxHeight, 3, 3, 'F');
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Hiring Potential', 25, yPosition + 8);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(lines, 25, yPosition + 16);
    yPosition += boxHeight + 10;
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    'Generated by AI Interview System',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Save PDF
  const filename = `interview-report-${options.jobRole.replace(/\s+/g, '-')}-${options.date.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
