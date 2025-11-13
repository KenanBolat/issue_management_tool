import { pdf } from '@react-pdf/renderer';
import { Document } from '@react-pdf/renderer';
import { TicketPDFDocument, TicketPDFPage } from './TicketPDFDocument';

// Single ticket PDF generation
export const generateTicketPDF = async (ticket, formData) => {
    try {
        const blob = await pdf(<TicketPDFDocument ticket={ticket} formData={formData} />).toBlob();
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Ariza_Kayit_${formData.externalCode || 'Form'}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
    }
};

// ✅ UPDATED: Multi-ticket PDF generation with page numbers
export const generateMultipleTicketsPDF = async (ticketsData) => {
    if (!ticketsData || ticketsData.length === 0) {
        alert('Seçili sorun bulunamadı!');
        return;
    }

    try {
        const totalPages = ticketsData.length;

        const MultiPageDocument = (
            <Document>
                {ticketsData.map(({ ticket, formData }, index) => (
                    <TicketPDFPage 
                        key={`ticket-${ticket.id || index}`} 
                        ticket={ticket} 
                        formData={formData}
                        pageNumber={index + 1}  // ✅ Current page (1-indexed)
                        totalPages={totalPages}  // ✅ Total pages
                    />
                ))}
            </Document>
        );

        const blob = await pdf(MultiPageDocument).toBlob();
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Ariza_Kayit_Toplu_${totalPages}_Sorun_${new Date().getTime()}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Multi PDF Generation Error:', error);
        throw error;
    }
};