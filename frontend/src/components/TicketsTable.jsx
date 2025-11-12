import { useState, useEffect } from "react";
import { ticketsAPI } from "../../services/api";
import { Edit, Trash2, Eye } from "lucide-react";


export default function TicketsTable({ onViewTicket, onEditTicket, onCreateTicket }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [filter, setFilter] = useState("");

    const STATUS_LABELS = {
        'OPEN': 'AÇIK',
        'PAUSED': 'DURDURULDU',
        'CONFIRMED': 'DOĞRULANDI',
        'CLOSED': 'KAPANDI',
        'REOPENED': 'TEKRAR AÇILDI',
        'CANCELLED': 'İPTAL'
    };

    const getStatusLabel = (status) => {
        return STATUS_LABELS[status] || status;
    };

    useEffect(() => {
        loadTickets();
    }, [statusFilter]);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const response = await ticketsAPI.getAll(statusFilter || null);
            const ticketsData = Array.isArray(response.data) ? response.data : [];
            setTickets(ticketsData);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async (ticketId) => {
        if (!window.confirm('Bu arıza kaydını silmek istediğinize emin misiniz?')) return;
        try {
            await ticketsAPI.delete(ticketId);
            alert('Arıza kaydı silindi');
            loadTickets();
        } catch (error) {
            console.error('Error deleting ticket:', error);
            alert('Arıza kaydı silinirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };



    // Sorting function
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

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



    // Simple filtering
    const filteredTickets = tickets.filter(ticket => {
        if (!searchText) return true;
        const search = searchText.toLowerCase();
        return (
            ticket.title.toLowerCase().includes(search) ||
            ticket.externalCode.toLowerCase().includes(search)
        );
    }).sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        if (sortField === "createdAt") {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
        }

        if (sortOrder === "asc") {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });

    console.log('Filtered tickets:', filteredTickets.length);

    const userRole = localStorage.getItem("role");

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>SORUNLAR</h1>
                    <p style={styles.subtitle}>
                        {filteredTickets.length} / {tickets.length} sorun gösterilmektedir
                    </p>
                </div>
            </div>

            <div style={styles.controls}>
                <div style={styles.filterGroup}>
                    <input
                        type="text"
                        placeholder="Sorunları ara..."
                        value={filter}
                        onChange={(e) => {
                            console.log('Search filter changed:', e.target.value);
                            setFilter(e.target.value);
                        }}
                        style={styles.searchInput}
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            console.log('Status filter changed:', e.target.value);
                            setStatusFilter(e.target.value);
                        }}
                        style={styles.select}
                    >
                        <option value="">Durumlar</option>
                        <option value="OPEN">Açık</option>
                        <option value="CONFIRMED">Onaylanmış</option>
                        <option value="PAUSED">Durdurulmuş</option>
                        <option value="CLOSED">Kapalı</option>
                        <option value="CANCELLED">İptal Edilmiş</option>
                        <option value="REOPENED">Tekrar Açılmış</option>
                    </select>

                    <button onClick={() => {
                        console.log('Refresh clicked');
                        loadTickets();
                    }} style={styles.refreshBtn}>
                        Tazele
                    </button>
                </div>

                {(userRole === 'Editor' || userRole === 'Admin') && (
                    <button
                        style={styles.addBtn}
                        onClick={() => onCreateTicket()}
                    >
                        + Yeni Sorun Ekle
                    </button>
                )}
            </div>

            {loading ? (
                <div style={styles.loading}>Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No tickets found</p>
                    {tickets.length > 0 && filter && (
                        <p style={{ fontSize: '0.9rem', color: '#999' }}>
                            Try clearing the search filter. {tickets.length} total tickets available.
                        </p>
                    )}
                    {tickets.length === 0 && (
                        <p style={{ fontSize: '0.9rem', color: '#999' }}>
                            No tickets in the system yet.
                        </p>
                    )}
                </div>
            ) : (
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th} onClick={() => handleSort('id')}>
                                    Sorun Kodu {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th style={styles.th} onClick={() => handleSort('externalCode')}>
                                    TTCOMS-Kodu {sortField === 'externalCode' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th style={styles.th} onClick={() => handleSort('title')}>
                                    Başlık {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th style={styles.th} onClick={() => handleSort('createdAt')}>
                                    Tarih {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th style={styles.th} onClick={() => handleSort('status')} >
                                    Durum {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                                <th style={styles.th} onClick={() => handleSort('createdByName')}>
                                    Oluşturan {sortField === 'createdBy' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                                <th style={styles.th}>CI</th>
                                <th style={styles.th}>Düzenle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTickets.map((ticket) => (
                                <tr key={ticket.id} style={styles.tr}>
                                    <td style={styles.td}>#{ticket.id}</td>
                                    <td style={styles.td}>{ticket.externalCode}</td>
                                    <td style={styles.td}>
                                        <div style={styles.titleCell}>
                                            
                                            {ticket.isBlocking && (
                                                <span style={styles.blockingBadge}>KRİTİK</span>
                                            )} {ticket.title}
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: getStatusColor(ticket.status),
                                            color: getStatusTextColor(ticket.status),
                                        }}>
                                            {getStatusLabel(ticket.status)}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{ticket.createdByName}</td>
                                    <td style={styles.td}>
                                        {ticket.hasCICompleted && (
                                            <span style={styles.ciBadge}>✓ CI</span>
                                        )}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            <button style={styles.actionBtn} title="View Details" onClick={() => onViewTicket(ticket.id)}> <Eye size={16} /> </button>
                                            {(userRole === 'Editor' || userRole === 'Admin') && (
                                                <>
                                                    <button style={styles.actionBtn} title="Edit" onClick={() => onEditTicket(ticket.id)}><Edit size={16} /> </button>
                                                    {userRole === 'Admin' && (
                                                        <button
                                                            style={{ ...styles.actionBtn, color: '#d32f2f' }}
                                                            title="Delete"
                                                            onClick={() => handleDelete(ticket.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        padding: '2rem',
        maxWidth: '1600px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: 0,
    },
    subtitle: {
        color: '#666',
        fontSize: '0.9rem',
        margin: '0.5rem 0 0 0',
    },
    controls: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        gap: '1rem',
    },
    filterGroup: {
        display: 'flex',
        gap: '1rem',
        flex: 1,
    },
    searchInput: {
        padding: '0.6rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        flex: 1,
        maxWidth: '400px',
    },
    select: {
        padding: '0.6rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        minWidth: '150px',
    },
    refreshBtn: {
        padding: '0.6rem 1.2rem',
        background: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    addBtn: {
        padding: '0.6rem 1.2rem',
        background: '#4caf50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    loading: {
        textAlign: 'center',
        padding: '3rem',
        color: '#666',
        fontSize: '1.2rem',
    },
    emptyState: {
        textAlign: 'center',
        padding: '3rem',
        background: 'white',
        borderRadius: '8px',
        color: '#666',
    },
    tableWrapper: {
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '1rem',
        textAlign: 'left',
        background: '#f8f9fa',
        fontWeight: '600',
        borderBottom: '2px solid #dee2e6',
        cursor: 'pointer',
        userSelect: 'none',
    },
    tr: {
        borderBottom: '1px solid #dee2e6',
    },
    td: {
        padding: '1rem',
    },
    titleCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    blockingBadge: {
        padding: '0.2rem 0.5rem',
        background: '#ffebee',
        color: '#c62828',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '600',
    },
    statusBadge: {
        padding: '0.3rem 0.8rem',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: '500',
    },
    ciBadge: {
        padding: '0.2rem 0.5rem',
        background: '#fff3e0',
        color: '#f57c00',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: '500',
    },
    actions: {
        display: 'flex',
        gap: '0.5rem',
    },
    actionBtn: {
        padding: '0.4rem',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#667eea',
        display: 'flex',
        alignItems: 'center',
    },
};

