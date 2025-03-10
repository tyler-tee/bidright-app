// src/services/pdfExport.js
import { jsPDF } from 'jspdf';
import { formatCurrency, formatDate } from '../utils/formatters';

/**
 * Generate a PDF estimation document
 * @param {Object} estimate - The estimate data
 * @param {Object} metadata - Additional metadata for the estimate
 * @param {Object} options - PDF generation options
 * @returns {Blob} - PDF document as Blob
 */
export const generateEstimatePDF = (estimate, metadata, options = {}) => {
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
      textColor: '#333333',
      accentColor: '#2563eb', // Blue 600
      includeFooter: true
    };
    
    const pdfOptions = { ...defaultOptions, ...options };
    
    // Set document properties
    doc.setProperties({
      title: `${metadata.industryName} ${metadata.projectName} Estimate`,
      subject: 'Project Estimate',
      author: pdfOptions.companyName,
      creator: 'BidRight.app'
    });
    
    // Add company header
    addHeader(doc, pdfOptions);
    
    // Add estimate title and metadata
    addEstimateTitle(doc, metadata, pdfOptions);
    
    // Add estimate summary
    addEstimateSummary(doc, estimate, pdfOptions);
    
    // Add features list if available
    if (metadata.features && metadata.features.length > 0) {
      addFeaturesList(doc, metadata.features, pdfOptions);
    }
    
    // Add project breakdown if requested
    if (pdfOptions.includeBreakdown && estimate.projectBreakdown) {
      addProjectBreakdown(doc, estimate.projectBreakdown, pdfOptions);
    }
    
    // Add notes if requested and provided
    if (pdfOptions.includeNotes && pdfOptions.notes.trim()) {
      addNotes(doc, pdfOptions.notes, pdfOptions);
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
  
  // Add horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, 25, pageWidth - marginRight, 25);
}

/**
 * Add estimate title and date
 */
function addEstimateTitle(doc, metadata, options) {
  const marginLeft = 20;
  
  // Set accent color for title
  doc.setTextColor(options.accentColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PROJECT ESTIMATE', marginLeft, 35);
  
  // Reset to normal text color
  doc.setTextColor(options.textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  // Add date
  const dateText = `Date: ${formatDate(estimate.created || new Date().toISOString())}`;
  doc.text(dateText, marginLeft, 42);
  
  // Add client name if provided
  if (metadata.clientName) {
    doc.text(`Client: ${metadata.clientName}`, marginLeft, 48);
  }
  
  // Add project details
  doc.setFontSize(11);
  doc.text(`Industry: ${metadata.industryName || 'Custom Project'}`, marginLeft, 56);
  doc.text(`Project Type: ${metadata.projectName || 'Custom Type'}`, marginLeft, 62);
  doc.text(`Complexity: ${metadata.complexityName || 'Medium'}`, marginLeft, 68);
}

/**
 * Add estimate summary to PDF
 */
function addEstimateSummary(doc, estimate, options) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginRight = 20;
  const boxWidth = (pageWidth - marginLeft - marginRight - 5) / 2;
  
  // Set title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(options.textColor);
  doc.text('Estimate Summary', marginLeft, 82);
  
  // Draw boxes for time and cost estimates
  // Time estimate box
  doc.setFillColor(240, 247, 255); // Light blue background
  doc.roundedRect(marginLeft, 86, boxWidth, 25, 2, 2, 'F');
  
  // Cost estimate box
  doc.setFillColor(240, 249, 245); // Light green background
  doc.roundedRect(marginLeft + boxWidth + 5, 86, boxWidth, 25, 2, 2, 'F');
  
  // Add box content
  doc.setTextColor(options.textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Time Estimate:', marginLeft + 5, 94);
  doc.text('Cost Estimate:', marginLeft + boxWidth + 10, 94);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${estimate.hourRange.min}-${estimate.hourRange.max} hours`, marginLeft + 5, 102);
  doc.text(`${formatCurrency(estimate.costRange.min)}-${formatCurrency(estimate.costRange.max)}`, 
    marginLeft + boxWidth + 10, 102);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100); // Gray text for descriptions
  doc.text('Based on project type and selected features', marginLeft + 5, 108);
  doc.text('Recommended price range', marginLeft + boxWidth + 10, 108);
}

/**
 * Add features list to PDF
 */
function addFeaturesList(doc, features, options) {
  const marginLeft = 20;
  
  // Set section title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(options.textColor);
  doc.text('Included Features', marginLeft, 125);
  
  // Add features as bullet points
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  let yPosition = 132;
  features.forEach((feature, index) => {
    doc.text(`• ${feature}`, marginLeft + 3, yPosition);
    yPosition += 6;
    
    // Check if we need a new page
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
  });
  
  return yPosition + 5; // Return the next Y position
}

/**
 * Add project breakdown to PDF
 */
function addProjectBreakdown(doc, breakdown, options) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginRight = 20;
  
  // Check if we need a new page
  let yPosition = doc.previousAutoTable 
    ? doc.previousAutoTable.finalY + 15 
    : 150;
    
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Set section title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(options.textColor);
  doc.text('Project Task Breakdown', marginLeft, yPosition);
  
  yPosition += 8;
  
  // Use autoTable plugin if available, otherwise create simple table
  if (doc.autoTable) {
    doc.autoTable({
      startY: yPosition,
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
      margin: { left: marginLeft, right: marginRight }
    });
  } else {
    // Simplified table without autoTable plugin
    const colWidths = [80, 30, 40, 30];
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
    
    // Draw header
    doc.setFillColor(37, 99, 235); // Blue 600
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.rect(marginLeft, yPosition, tableWidth, 7, 'F');
    
    let xPos = marginLeft;
    ['Task', 'Hours', 'Cost', '% of Project'].forEach((header, i) => {
      doc.text(header, xPos + 2, yPosition + 5);
      xPos += colWidths[i];
    });
    
    yPosition += 7;
    
    // Draw rows
    breakdown.forEach((task, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(245, 247, 250);
        doc.rect(marginLeft, yPosition, tableWidth, 7, 'F');
      }
      
      doc.setTextColor(options.textColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      xPos = marginLeft;
      
      // Task name
      doc.text(task.name, xPos + 2, yPosition + 5);
      xPos += colWidths[0];
      
      // Hours
      doc.text(task.hours.toString(), xPos + 2, yPosition + 5);
      xPos += colWidths[1];
      
      // Cost
      doc.text(formatCurrency(task.cost), xPos + 2, yPosition + 5);
      xPos += colWidths[2];
      
      // Percentage
      doc.text(`${task.percentage}%`, xPos + 2, yPosition + 5);
      
      yPosition += 7;
      
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
    });
  }
}

/**
 * Add notes to PDF
 */
function addNotes(doc, notes, options) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginRight = 20;
  
  // Check if we need a new page
  let yPosition = doc.previousAutoTable 
    ? doc.previousAutoTable.finalY + 15 
    : 220;
    
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Set section title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(options.textColor);
  doc.text('Notes', marginLeft, yPosition);
  
  yPosition += 8;
  
  // Add notes with text wrapping
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const splitNotes = doc.splitTextToSize(notes, pageWidth - marginLeft - marginRight);
  doc.text(splitNotes, marginLeft, yPosition);
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
    
    // Add powered by text
    doc.text('Generated with BidRight.app', 20, 287);
  }
}