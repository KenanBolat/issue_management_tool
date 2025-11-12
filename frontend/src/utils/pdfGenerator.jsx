import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateTicketPDF = (ticket, formData) => {
    // Create PDF in LANDSCAPE mode
    const doc = new jsPDF('l', 'mm', 'a4'); // 'l' = landscape
    
    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };

    // Helper function to format personnel list with line breaks
    const formatPersonnelList = (personnelArray) => {
        if (!personnelArray || personnelArray.length === 0) return '';
        return personnelArray.map(p => p.displayName).join(',\n');
    };

    // Set default font for Turkish character support
    doc.setFont('helvetica');
    
    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ARIZA KAYIT FORMU', 148, 12, { align: 'center' });

    let currentY = 18;

    // CRITICAL: Use full A4 landscape width (297mm - 20mm margins = 277mm)
    const TOTAL_WIDTH = 277;

    // ============================================
    // SECTION 1: Main Information
    // ============================================
    autoTable(doc, {
        startY: currentY,
        head: [[
            'ARIZA NO',
            'ARIZANIN TESPIT\nEDILDIGI TARIH / SAAT',
            'YUKLENICIYE BILDIRIM\nTARIHI / SAATI',
            'BILDIRIM SEKLI\n(Cikisa / Fotokopisi Forma Eklenecektir)',
            'OPERASYONEL AKISI ETKILER'
        ]],
        body: [[
            formData.externalCode || '',
            formatDate(formData.detectedDate),
            formatDate(formData.detectedContractorNotifiedAt),
            formData.ttcomsCode ? `TTCOMS (${formData.ttcomsCode})` : (formData.detectedNotificationMethods || []).join(', '),
            formData.isBlocking ? 'EVET' : 'HAYIR'
        ]],
        theme: 'grid',
        styles: { 
            fontSize: 6.5, 
            cellPadding: 1, 
            halign: 'center', 
            valign: 'middle',
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            overflow: 'linebreak',
            cellWidth: 'wrap'
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center',
            minCellHeight: 8
        },
        bodyStyles: {
            minCellHeight: 8
        },
        columnStyles: {
            0: { cellWidth: 34 },
            1: { cellWidth: 49 },
            2: { cellWidth: 49 },
            3: { cellWidth: 103 },
            4: { cellWidth: 42 }
        },
        margin: { left: 10, right: 10 },
        tableWidth: TOTAL_WIDTH
    });

    currentY = doc.lastAutoTable.finalY + 0.5;

    // ============================================
    // SECTION 2: Part Information
    // ============================================
    autoTable(doc, {
        startY: currentY,
        head: [[
            'PARCA TANIMI',
            'PARCA NO',
            'SERI NO',
            'ARIZAYI TESPIT EDEN PERSONEL\nRUTBE - ADI SOYADI'
        ]],
        body: [[
            formData.itemDescription || '',
            formData.itemId || '',
            formData.itemSerialNo || '',
            ticket?.detectedByUserName || ''
        ]],
        theme: 'grid',
        styles: { 
            fontSize: 6.5, 
            cellPadding: 1, 
            halign: 'center', 
            valign: 'middle',
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            overflow: 'linebreak',
            cellWidth: 'wrap'
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            minCellHeight: 8
        },
        bodyStyles: {
            minCellHeight: 8
        },
        columnStyles: {
            0: { cellWidth: 69.25 },
            1: { cellWidth: 69.25 },
            2: { cellWidth: 69.25 },
            3: { cellWidth: 69.25 }
        },
        margin: { left: 10, right: 10 },
        tableWidth: TOTAL_WIDTH
    });

    currentY = doc.lastAutoTable.finalY + 0.5;

    // ============================================
    // SECTION 3: Fault Description WITH SIGNATURE COLUMN
    // ============================================
    autoTable(doc, {
        startY: currentY,
        head: [[
            'TESPIT EDILEN ARIZA',
            'IMZA'
        ]],
        body: [[
            formData.description || '',
            ''  // Empty signature column
        ]],
        theme: 'grid',
        styles: { 
            fontSize: 6.5, 
            cellPadding: 1.5,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            valign: 'top',
            overflow: 'linebreak',
            cellWidth: 'wrap'
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center',
            minCellHeight: 6
        },
        bodyStyles: {
            minCellHeight: 12
        },
        columnStyles: {
            0: { cellWidth: 252, halign: 'left' },  // Main content column
            1: { cellWidth: 25, halign: 'center' }   // Signature column
        },
        margin: { left: 10, right: 10 },
        tableWidth: TOTAL_WIDTH
    });

    currentY = doc.lastAutoTable.finalY + 0.5;

    // ============================================
    // SECTION 4: Contractor Actions Header
    // ============================================
    autoTable(doc, {
        startY: currentY,
        body: [[{
            content: 'YUKLENICI FIRMA TARAFINDAN YAPILAN ISLEMLER',
            styles: { fontStyle: 'bold', halign: 'center', fillColor: [220, 220, 220] }
        }]],
        theme: 'grid',
        styles: { 
            fontSize: 7, 
            cellPadding: 1,
            lineColor: [0, 0, 0],
            lineWidth: 0.1
        },
        margin: { left: 10, right: 10 },
        tableWidth: TOTAL_WIDTH
    });

    currentY = doc.lastAutoTable.finalY + 0.5;

    // ============================================
    // SECTION 5: Response Details
    // ============================================
    autoTable(doc, {
        startY: currentY,
        head: [[
            'ARIZAYA MUDAHALE EDEN\nPERSONEL',
            'ARIZAYA MUDAHALE\nTARIHI / SAATI',
            'ARIZANIN GIDERILDIGI\nTARIH / SAAT',
            'ARIZAYI GIDEREN SORUMLU\nYUKLENICI PERSONELI - ADI SOYADI'
        ]],
        body: [[
            formatPersonnelList(ticket?.responsePersonnel),
            formatDate(formData.responseDate),
            formatDate(formData.responseResolvedAt),
            formatPersonnelList(ticket?.responseResolvedPersonnel)
        ]],
        theme: 'grid',
        styles: { 
            fontSize: 6.5, 
            cellPadding: 1, 
            halign: 'center', 
            valign: 'middle',
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            overflow: 'linebreak',
            cellWidth: 'wrap'
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            minCellHeight: 10
        },
        bodyStyles: {
            minCellHeight: 10
        },
        columnStyles: {
            0: { cellWidth: 69.25 },
            1: { cellWidth: 69.25 },
            2: { cellWidth: 69.25 },
            3: { cellWidth: 69.25 }
        },
        margin: { left: 10, right: 10 },
        tableWidth: TOTAL_WIDTH
    });

    currentY = doc.lastAutoTable.finalY + 0.5;

    // ============================================
    // SECTION 6: Actions Taken WITH SIGNATURE COLUMN
    // ============================================
    autoTable(doc, {
        startY: currentY,
        head: [[
            'ARIZAYA ILISKIN YAPILAN ISLEM VE FAAL EDILMESI ICIN GEREKLI IHTIYACLAR',
            'IMZA'
        ]],
        body: [[
            formData.responseActions || '',
            ''  // Empty signature column
        ]],
        theme: 'grid',
        styles: { 
            fontSize: 6.5, 
            cellPadding: 1.5,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            valign: 'top',
            overflow: 'linebreak',
            cellWidth: 'wrap'
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center',
            minCellHeight: 6
        },
        bodyStyles: {
            minCellHeight: 12
        },
        columnStyles: {
            0: { cellWidth: 252, halign: 'left' },  // Main content column
            1: { cellWidth: 25, halign: 'center' }   // Signature column
        },
        margin: { left: 10, right: 10 },
        tableWidth: TOTAL_WIDTH
    });

    currentY = doc.lastAutoTable.finalY + 0.5;

    // ============================================
    // SECTION 7: Activity Control Header
    // ============================================
    autoTable(doc, {
        startY: currentY,
        body: [[{
            content: 'FAALIYET KONTROLU',
            styles: { fontStyle: 'bold', halign: 'center', fillColor: [220, 220, 220] }
        }]],
        theme: 'grid',
        styles: { 
            fontSize: 7, 
            cellPadding: 1,
            lineColor: [0, 0, 0],
            lineWidth: 0.1
        },
        margin: { left: 10, right: 10 },
        tableWidth: TOTAL_WIDTH
    });

    currentY = doc.lastAutoTable.finalY + 0.5;

    // ============================================
    // SECTION 8: Activity Control Details
    // ============================================
    const activityPersonnelName = ticket?.activityControlPersonnelName || '';
    const activityCommanderName = ticket?.activityControlCommanderName || '';

    autoTable(doc, {
        startY: currentY,
        head: [[
            'FAALIYET KONTROLUNU\nYAPAN KULLANICI PERSONELI\nRUTBE - ADI SOYADI / IMZA',
            'SONUC (FAAL / GAYRI FAAL)\n(Gayri faal ise gerekcesi ve\nfaaliyet icin oneriler\nyazilacaktir - Sozlesme\ngereklerine gore)',
            'TARIH / SAAT',
            'BIRIM KOMUTANI\nRUTBE - ADI SOYADI / IMZA'
        ]],
        body: [[
            activityPersonnelName || '',
            formData.activityControlResult || '',
            formatDate(formData.activityControlDate),
            activityCommanderName || ''
        ]],
        theme: 'grid',
        styles: { 
            fontSize: 6.5, 
            cellPadding: 1, 
            halign: 'center', 
            valign: 'middle',
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            overflow: 'linebreak',
            cellWidth: 'wrap'
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            minCellHeight: 12
        },
        bodyStyles: {
            minCellHeight: 15
        },
        columnStyles: {
            0: { cellWidth: 69.25 },
            1: { cellWidth: 69.25 },
            2: { cellWidth: 69.25 },
            3: { cellWidth: 69.25 }
        },
        margin: { left: 10, right: 10 },
        tableWidth: TOTAL_WIDTH
    });

    currentY = doc.lastAutoTable.finalY + 0.5;

    // ============================================
    // SECTION 9: Approval
    // ============================================
    autoTable(doc, {
        startY: currentY,
        body: [
            [{ content: 'ONAY', styles: { fontStyle: 'bold', halign: 'center' } }],
            [{ content: formatDate(new Date()), styles: { halign: 'center' } }]
        ],
        theme: 'grid',
        styles: { 
            fontSize: 7, 
            cellPadding: 1.5,
            lineColor: [0, 0, 0],
            lineWidth: 0.1
        },
        margin: { left: 10, right: 10 },
        tableWidth: TOTAL_WIDTH
    });

    // Page number at bottom
    doc.setFontSize(8);
    doc.text('1 - 1', 148, 200, { align: 'center' });

    // Save the PDF
    const fileName = `Ariza_Kayit_${formData.externalCode || 'Form'}.pdf`;
    doc.save(fileName);
};