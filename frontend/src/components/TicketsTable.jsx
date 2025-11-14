import { useState, useEffect } from "react";
import { ticketsAPI } from "../../services/api";
import { Edit, Trash2, Eye, FileText, Download } from "lucide-react";
import { generateMultipleTicketsPDF } from "../utils/pdfGenerator";

export default function TicketsTable({ onViewTicket, onEditTicket, onCreateTicket }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    
    // ✅ NEW: Selection state
    const [selectedTickets, setSelectedTickets] = useState(new Set());
    const [generatingPDF, setGeneratingPDF] = useState(false);

    const STATUS_LABELS = {
        'OPEN': 'AÇIK',
        'PAUSED': 'DURDURULDU',
        'CONFIRMED': 'DOĞRULANDI',
        'CLOSED': 'KAPANDI',
        'REOPENED': 'TEKRAR AÇILDI',
        'CANCELLED': 'İPTAL'
    };

    useEffect(() => {
        loadTickets();
    }, [statusFilter]);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const response = await ticketsAPI.getAll(statusFilter);
            setTickets(response.data);
        } catch (error) {
            console.error("Error loading tickets:", error);
            alert("Error loading tickets");
        } finally {
            setLoading(false);
        }
    };

    // ✅ NEW: Toggle individual ticket selection
    const handleToggleTicket = (ticketId) => {
        setSelectedTickets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(ticketId)) {
                newSet.delete(ticketId);
            } else {
                newSet.add(ticketId);
            }
            return newSet;
        });
    };

    // ✅ NEW: Toggle all tickets selection
    const handleToggleAll = () => {
        if (selectedTickets.size === tickets.length) {
            setSelectedTickets(new Set());
        } else {
            setSelectedTickets(new Set(tickets.map(t => t.id)));
        }
    };

    // ✅ NEW: Generate bulk PDF
    const handleGenerateBulkPDF = async () => {
        if (selectedTickets.size === 0) {
            alert("Lütfen en az bir sorun seçiniz!");
            return;
        }

        try {
            setGeneratingPDF(true);
            
            // Fetch full details for all selected tickets
            const ticketDetailsPromises = Array.from(selectedTickets).map(async (ticketId) => {
                const response = await ticketsAPI.getById(ticketId);
                const ticketData = response.data;
                
                // Format the data for PDF (same as TicketDetail does)
                const formData = {
                    externalCode: ticketData.externalCode || '',
                    title: ticketData.title || '',
                    description: ticketData.description || '',
                    isBlocking: ticketData.isBlocking || false,
                    itemDescription: ticketData.itemDescription || '',
                    itemId: ticketData.itemId || '',
                    itemSerialNo: ticketData.itemSerialNo || '',
                    detectedDate: ticketData.detectedDate,
                    detectedContractorNotifiedAt: ticketData.detectedContractorNotifiedAt,
                    detectedNotificationMethods: ticketData.detectedNotificationMethods || [],
                    responseDate: ticketData.responseDate,
                    responseResolvedAt: ticketData.responseResolvedAt,
                    responseActions: ticketData.responseActions || '',
                    activityControlDate: ticketData.activityControlDate,
                    activityControlResult: ticketData.activityControlResult || '',
                    ttcomsCode: ticketData.ttcomsCode || '',
                };

                return { ticket: ticketData, formData };
            });

            // Wait for all ticket details to load
            const ticketsData = await Promise.all(ticketDetailsPromises);

            // Generate PDF with all tickets
            await generateMultipleTicketsPDF(ticketsData);
            
            alert(`${selectedTickets.size} adet sorun raporu PDF olarak oluşturuldu!`);
            
            // Clear selection after successful generation
            setSelectedTickets(new Set());
            
        } catch (error) {
            console.error("Error generating bulk PDF:", error);
            alert("PDF oluşturulurken hata oluştu: " + error.message);
        } finally {
            setGeneratingPDF(false);
        }
    };

    const getStatusLabel = (status) => STATUS_LABELS[status] || status;

    if (loading) {
        return <div style={styles.loading}>Sorunlar yükleniyor...</div>;
    }

    return (
        <div style={styles.container}>
            {/* Header with filters and actions */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <h1 style={styles.title}>Sorunlar (Tickets)</h1>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={styles.filterSelect}
                    >
                        <option value="">Tüm Durumlar</option>
                        <option value="OPEN">Açık</option>
                        <option value="CONFIRMED">Doğrulandı</option>
                        <option value="PAUSED">Durduruldu</option>
                        <option value="CLOSED">Kapatıldı</option>
                        <option value="REOPENED">Yeniden Açıldı</option>
                        <option value="CANCELLED">İptal</option>
                    </select>
                </div>
                <div style={styles.headerRight}>
                    {/* ✅ NEW: Bulk PDF button */}
                    {selectedTickets.size > 0 && (
                        <button
                            onClick={handleGenerateBulkPDF}
                            style={{ ...styles.button, ...styles.pdfButton }}
                            disabled={generatingPDF}
                        >
                            <Download size={18} />
                            {generatingPDF 
                                ? 'PDF Oluşturuluyor...' 
                                : `${selectedTickets.size} Sorun için PDF Rapor`}
                        </button>
                    )}
                    <button
                        onClick={onCreateTicket}
                        style={{ ...styles.button, ...styles.createButton }}
                    >
                        + Yeni Sorun
                    </button>
                </div>
            </div>

            {/* Tickets table */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            {/* ✅ NEW: Select all checkbox */}
                            <th style={{ ...styles.th, width: '50px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedTickets.size === tickets.length && tickets.length > 0}
                                    onChange={handleToggleAll}
                                    style={styles.checkbox}
                                />
                            </th>
                            <th style={styles.th}>Sorun No</th>
                            <th style={styles.th}>Başlık</th>
                            <th style={styles.th}>Durum</th>
                            <th style={styles.th}>Tespit Eden</th>
                            <th style={styles.th}>Oluşturma Tarihi</th>
                            <th style={styles.th}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={styles.emptyMessage}>
                                    Sorun bulunamadı
                                </td>
                            </tr>
                        ) : (
                            tickets.map((ticket) => (
                                <tr 
                                    key={ticket.id} 
                                    style={{
                                        ...styles.row,
                                        backgroundColor: selectedTickets.has(ticket.id) ? '#e3f2fd' : 'white'
                                    }}
                                >
                                    {/* ✅ NEW: Individual checkbox */}
                                    <td style={styles.td}>
                                        <input
                                            type="checkbox"
                                            checked={selectedTickets.has(ticket.id)}
                                            onChange={() => handleToggleTicket(ticket.id)}
                                            style={styles.checkbox}
                                        />
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.ticketCode}>{ticket.externalCode}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.titleCell}>
                                            <span style={styles.ticketTitle}>{ticket.title}</span>
                                            {ticket.isBlocking && (
                                                <span style={styles.blockingBadge}>
                                                    ⚠️ Kritik
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span
                                            style={{
                                                ...styles.statusBadge,
                                                backgroundColor: getStatusColor(ticket.status),
                                                color: getStatusTextColor(ticket.status)
                                            }}
                                        >
                                            {getStatusLabel(ticket.status)}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{ticket.detectedByUserName || '-'}</td>
                                    <td style={styles.td}>
                                        {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            <button
                                                onClick={() => onViewTicket(ticket.id)}
                                                style={{ ...styles.actionButton, ...styles.viewButton }}
                                                title="Görüntüle"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => onEditTicket(ticket.id)}
                                                style={{ ...styles.actionButton, ...styles.editButton }}
                                                title="Düzenle"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ✅ NEW: Selection summary */}
            {selectedTickets.size > 0 && (
                <div style={styles.selectionSummary}>
                    <span>{selectedTickets.size} sorun seçildi</span>
                    <button
                        onClick={() => setSelectedTickets(new Set())}
                        style={styles.clearButton}
                    >
                        Seçimi Temizle
                    </button>
                </div>
            )}
        </div>
    );
}

// Helper functions
const getStatusColor = (status) => {
    const colors = {
        OPEN: '#e3f2fd',
        CONFIRMED: '#fff3e0',
        PAUSED: '#f3e5f5',
        CLOSED: '#e8f5e9',
        CANCELLED: '#ffebee',
        REOPENED: '#fce4ec',
    };
    return colors[status] || '#f5f5f5';
};

const getStatusTextColor = (status) => {
    const colors = {
        OPEN: '#1976d2',
        CONFIRMED: '#f57c00',
        PAUSED: '#7b1fa2',
        CLOSED: '#388e3c',
        CANCELLED: '#d32f2f',
        REOPENED: '#c2185b',
    };
    return colors[status] || '#666';
};

const styles = {
    container: {
        padding: '1.5rem',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    headerRight: {
        display: 'flex',
        gap: '0.5rem',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: 0,
    },
    filterSelect: {
        padding: '0.5rem 1rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.9rem',
        cursor: 'pointer',
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1.2rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'all 0.2s',
    },
    createButton: {
        backgroundColor: '#4caf50',
        color: 'white',
    },
    pdfButton: {
        backgroundColor: '#2196f3',
        color: 'white',
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '1rem',
        textAlign: 'left',
        backgroundColor: '#f5f5f5',
        fontWeight: '600',
        fontSize: '0.9rem',
        color: '#555',
        borderBottom: '2px solid #ddd',
    },
    td: {
        padding: '1rem',
        borderBottom: '1px solid #eee',
        fontSize: '0.9rem',
    },
    row: {
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    checkbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
    },
    ticketCode: {
        fontWeight: '600',
        color: '#1976d2',
    },
    titleCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    ticketTitle: {
        flex: 1,
    },
    blockingBadge: {
        padding: '0.2rem 0.5rem',
        backgroundColor: '#ffebee',
        color: '#d32f2f',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '600',
    },
    statusBadge: {
        padding: '0.3rem 0.8rem',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '500',
        display: 'inline-block',
    },
    actions: {
        display: 'flex',
        gap: '0.5rem',
    },
    actionButton: {
        padding: '0.4rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s',
    },
    viewButton: {
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
    },
    editButton: {
        backgroundColor: '#fff3e0',
        color: '#f57c00',
    },
    selectionSummary: {
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: '500',
    },
    clearButton: {
        padding: '0.5rem 1rem',
        backgroundColor: 'white',
        border: '1px solid #1976d2',
        color: '#1976d2',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '500',
    },
    emptyMessage: {
        padding: '3rem',
        textAlign: 'center',
        color: '#999',
        fontSize: '1rem',
    },
    loading: {
        textAlign: 'center',
        padding: '3rem',
        fontSize: '1.2rem',
        color: '#666',
    },
};