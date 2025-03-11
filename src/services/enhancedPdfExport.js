// src/services/enhancedPdfExport.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Import for better table support
import { formatCurrency, formatDate } from '../utils/formatters';

/**
 * Generate a professional PDF estimation document
 * @param {Object} estimate - The estimate data
 * @param {Object} metadata - Additional metadata for the estimate
 * @param {Object} options - PDF generation options
 * @returns {Blob} - PDF document as Blob
 */
export const generateEstimatePDF = async (estimate, metadata, options = {}) => {
  try {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set default options
    const defaultOptions = {
      includeBreakdown: true,
      includeCompanyLogo: true,
      includeNotes: true,
      notes: '',
      companyName: metadata.companyName || 'Your Company',
      companyLogo: null, // Base64 encoded image
      companyAddress: metadata.companyAddress || '',
      companyEmail: metadata.companyEmail || '',
      companyPhone: metadata.companyPhone || '',
      clientName: metadata.clientName || '',
      clientEmail: metadata.clientEmail || '',
      textColor: '#333333',
      accentColor: '#2563eb', // Blue 600
      includeFooter: true,
      estimateNumber: `EST-${Date.now().toString().slice(-6)}`,
      includeTerms: true,
      terms: metadata.terms || 'Standard terms apply. Payment due within 30 days of invoice.',
      whiteLabel: false // Premium feature to remove BidRight branding
    };
    
    const pdfOptions = { ...defaultOptions, ...options };
    
    // Set document properties
    doc.setProperties({
      title: `${metadata.industryName} ${metadata.projectName} Estimate`,
      subject: 'Project Estimate',
      author: pdfOptions.companyName,
      creator: pdfOptions.whiteLabel ? pdfOptions.companyName : 'BidRight.app'
    });
    
    // Add company header
    let yPos = addHeader(doc, pdfOptions);
    
    // Add estimate title and metadata
    yPos = addEstimateTitle(doc, metadata, pdfOptions, yPos);
    
    // Add estimate summary
    yPos = addEstimateSummary(doc, estimate, pdfOptions, yPos);
    
    // Add features list if available
    if (metadata.features && metadata.features.length > 0) {
      yPos = addFeaturesList(doc, metadata.features, pdfOptions, yPos);
    }
    
    // Add project breakdown if requested
    if (pdfOptions.includeBreakdown && estimate.projectBreakdown) {
      // Check if we need a new page
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }
      
      yPos = addProjectBreakdown(doc, estimate.projectBreakdown, pdfOptions, yPos);
    }
    
    // Add notes if requested and provided
    if (pdfOptions.includeNotes && pdfOptions.notes.trim()) {
      // Check if we need a new page
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }
      
      yPos = addNotes(doc, pdfOptions.notes, pdfOptions, yPos);
    }
    
    // Add terms if requested
    if (pdfOptions.includeTerms) {
      // Check if we need a new page
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      yPos = addTerms(doc, pdfOptions.terms, pdfOptions, yPos);
    }
    
    // Add footer with page numbers
    if (pdfOptions.includeFooter) {
      addFooter(doc, pdfOptions);
    }
    
    // Return the PDF as blob
    return doc.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF document');
  }
};

/**
 * Add header with company information to PDF
 */
function addHeader(doc, options) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginRight = 20;
  
  // Set text color
  doc.setTextColor(options.textColor);
  
  // Add company name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(options.companyName, marginLeft, 20);
  
  // Add company logo if provided
  if (options.includeCompanyLogo && options.companyLogo) {
    try {
      doc.addImage(options.companyLogo, 'JPEG', pageWidth - 60 - marginRight, 10, 40, 15, '', 'FAST');
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }
  
  // Add company contact info if provided
  let yPos = 25;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  if (options.companyAddress) {
    doc.text(options.companyAddress, marginLeft, yPos);
    yPos += 4;
  }
  
  let contactText = '';
  if (options.companyPhone) contactText += `Phone: ${options.companyPhone}  `;
  if (options.companyEmail) contactText += `Email: ${options.companyEmail}`;
  
  if (contactText) {
    doc.text(contactText, marginLeft, yPos);
    yPos += 4;
  }
  
  // Add horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  
  return yPos + 5;
}

/**
 * Add estimate title and date
 */
function addEstimateTitle(doc, metadata, options, startY) {
  const marginLeft = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginRight = 20;
  
  let yPos = startY + 5;
  
  // Set accent color for title
  doc.setTextColor(options.accentColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PROJECT ESTIMATE', marginLeft, yPos);
  
  // Add estimate number
  doc.setFontSize(10);
  doc.setTextColor(options.textColor);
  doc.text(`Estimate #: ${options.estimateNumber}`, pageWidth - marginRight - 50, yPos);
  
  yPos += 7;
  
  // Reset to normal text color
  doc.setTextColor(options.textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Add date
  const dateText = `Date: ${formatDate(metadata.created || new Date().toISOString())}`;
  doc.text(dateText, marginLeft, yPos);
  
  yPos += 5;
  
  // Add client info if provided
  if (options.clientName) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Client:', marginLeft, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(options.clientName, marginLeft + 20, yPos);
    yPos += 5;
    
    if (options.clientEmail) {
      doc.text('Email:', marginLeft, yPos);
      doc.text(options.clientEmail, marginLeft + 20, yPos);
      yPos += 5;
    }
  }
  
  yPos += 3;
  
  // Add project details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Details', marginLeft, yPos);
  yPos += 5;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Industry: ${metadata.industryName || 'Custom Project'}`, marginLeft, yPos);
  yPos += 5;
  
  doc.text(`Project Type: ${metadata.projectName || 'Custom Type'}`, marginLeft, yPos);
  yPos += 5;
  
  doc.text(`Complexity: ${metadata.complexityName || 'Medium'}`, marginLeft, yPos);
  yPos += 10;
  
  return yPos;
}

/**
 * Add estimate summary to PDF
 */
function addEstimateSummary(doc, estimate, options, startY) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginRight = 20;
  const boxWidth = (pageWidth - marginLeft - marginRight - 5) / 2;
  
  let yPos = startY;
  
  // Set title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(options.textColor);
  doc.text('Estimate Summary', marginLeft, yPos);
  
  yPos += 4;
  
  // Draw boxes for time and cost estimates
  // Time estimate box
  doc.setFillColor(240, 247, 255); // Light blue background
  doc.roundedRect(marginLeft, yPos, boxWidth, 25, 2, 2, 'F');
  
  // Cost estimate box
  doc.setFillColor(240, 249, 245); // Light green background
  doc.roundedRect(marginLeft + boxWidth + 5, yPos, boxWidth, 25, 2, 2, 'F');
  
  // Add box content
  doc.setTextColor(options.textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Time Estimate:', marginLeft + 5, yPos + 8);
  doc.text('Cost Estimate:', marginLeft + boxWidth + 10, yPos + 8);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${estimate.hourRange.min}-${estimate.hourRange.max} hours`, marginLeft + 5, yPos + 16);
  doc.text(`${formatCurrency(estimate.costRange.min)}-${formatCurrency(estimate.costRange.max)}`, 
    marginLeft + boxWidth + 10, yPos + 16);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100); // Gray text for descriptions
  doc.text('Based on project type and selected features', marginLeft + 5, yPos + 22);
  doc.text('Recommended price range', marginLeft + boxWidth + 10, yPos + 22);
  
  return yPos + 30;
}

/**
 * Add features list to PDF
 */
function addFeaturesList(doc, features, options, startY) {
  const marginLeft = 20;
  
  let yPos = startY + 5;
  
  // Set section title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(options.textColor);
  doc.text('Included Features', marginLeft, yPos);
  
  yPos += 7;
  
  // Add features as bullet points
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  features.forEach((feature, index) => {
    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.circle(marginLeft + 1.5, yPos - 1.5, 1, 'F');
    doc.text(feature, marginLeft + 5, yPos);
    yPos += 6;
  });
  
  return yPos + 5;
}

/**
 * Add project breakdown to PDF
 */
function addProjectBreakdown(doc, breakdown, options, startY) {
  const marginLeft = 20;
  const marginRight = 20;
  
  let yPos = startY + 5;
  
  // Set section title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(options.textColor);
  doc.text('Project Task Breakdown', marginLeft, yPos);
  
  yPos += 7;
  
  // Check if autoTable plugin is available
  if (typeof doc.autoTable === 'function') {
    // Use autoTable for better formatting
    doc.autoTable({
      startY: yPos,
      head: [['Task', 'Hours', 'Cost', '% of Project']],
      body: breakdown.map(task => [
        task.name,
        task.hours,
        formatCurrency(task.cost),
        `${task.percentage}%`
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235], // Blue 600
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { left: marginLeft, right: marginRight },
      styles: {
        fontSize: 10,
        cellPadding: 3
      }
    });
    
    // Update yPos to the final position after the table
    yPos = doc.previousAutoTable.finalY + 10;
  } else {
    // Fallback to manual table rendering if autoTable is not available
    const colWidths = [80, 30, 40, 30];
    const rowHeight = 8;
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
    
    // Draw header
    doc.setFillColor(37, 99, 235); // Blue 600
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.rect(marginLeft, yPos, tableWidth, rowHeight, 'F');
    
    let xPos = marginLeft;
    ['Task', 'Hours', 'Cost', '% of Project'].forEach((header, i) => {
      doc.text(header, xPos + 2, yPos + 5);
      xPos += colWidths[i];
    });
    
    yPos += rowHeight;
    
    // Draw rows
    doc.setTextColor(options.textColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    breakdown.forEach((task, index) => {
      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(245, 247, 250);
        doc.rect(marginLeft, yPos, tableWidth, rowHeight, 'F');
      }
      
      xPos = marginLeft;
      
      // Task name
      doc.text(task.name, xPos + 2, yPos + 5);
      xPos += colWidths[0];
      
      // Hours
      doc.text(task.hours.toString(), xPos + 2, yPos + 5);
      xPos += colWidths[1];
      
      // Cost
      doc.text(formatCurrency(task.cost), xPos + 2, yPos + 5);
      xPos += colWidths[2];
      
      // Percentage
      doc.text(`${task.percentage}%`, xPos + 2, yPos + 5);
      
      yPos += rowHeight;
    });
    
    yPos += 5;
  }
  
  return yPos;
}

/**
 * Add notes to PDF
 */
function addNotes(doc, notes, options, startY) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginRight = 20;
  
  let yPos = startY + 5;
  
  // Set section title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(options.textColor);
  doc.text('Notes', marginLeft, yPos);
  
  yPos += 7;
  
  // Add notes box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(250, 250, 250);
  const boxHeight = Math.min(60, notes.length / 3);
  doc.roundedRect(marginLeft, yPos, pageWidth - marginLeft - marginRight, boxHeight, 2, 2, 'FD');
  
  // Add notes with text wrapping
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(options.textColor);
  
  const splitNotes = doc.splitTextToSize(notes, pageWidth - marginLeft - marginRight - 10);
  doc.text(splitNotes, marginLeft + 5, yPos + 7);
  
  return yPos + boxHeight + 10;
}

/**
 * Add terms to PDF
 */
function addTerms(doc, terms, options, startY) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginRight = 20;
  
  let yPos = startY + 5;
  
  // Set section title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(options.textColor);
  doc.text('Terms & Conditions', marginLeft, yPos);
  
  yPos += 7;
  
  // Add terms with text wrapping
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const splitTerms = doc.splitTextToSize(terms, pageWidth - marginLeft - marginRight);
  doc.text(splitTerms, marginLeft, yPos);
  
  return yPos + (splitTerms.length * 4) + 5;
}

/**
 * Add footer with page numbers
 */
function addFooter(doc, options) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Add page number
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 40, 287);
    
    // Add powered by text - only if not white labeled (Premium feature)
    if (!options.whiteLabel) {
      doc.text('Generated with BidRight.app', 20, 287);
    }
  }
}