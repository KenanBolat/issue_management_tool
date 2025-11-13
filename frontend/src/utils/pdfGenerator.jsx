import { pdf } from '@react-pdf/renderer';
import { TicketPDFDocument } from './TicketPDFDocument';

export const generateTicketPDF = async (ticket, formData) => {
    const blob = await pdf(<TicketPDFDocument ticket={ticket} formData={formData} />).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ariza_Kayit_${formData.externalCode || 'Form'}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
};

export const generateMultipleTicketsPDF = async (ticketsData) => {
    if (!ticketsData || ticketsData.length === 0) {
        alert('Seçili sorun bulunamadı!');
        return;
    }
    debugger;

    // Create document with multiple pages
    const MultiPageDocument = () => (
        <>
            {ticketsData.map(({ ticket, formData }, index) => (
                <TicketPDFDocument key={index} ticket={ticket} formData={formData} />
            ))}
        </>
    );

    const blob = await pdf(<MultiPageDocument />).toBlob();
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ariza_Kayit_Toplu_${new Date().getTime()}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
};