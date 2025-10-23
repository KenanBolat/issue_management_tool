import { useState, useEffect } from "react";
import { ticketsAPI } from "../../services/api";
import { Edit, Trash2, Eye } from "lucide-react";

export default function TicketsTable() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

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

    // Simple filtering
    const filteredTickets = tickets.filter(ticket => {
        if (!searchText) return true;
        const search = searchText.toLowerCase();
        return (
            ticket.title.toLowerCase().includes(search) ||
            ticket.externalCode.toLowerCase().includes(search)
        );
    });

    const userRole = localStorage.getItem("userRole");

    if (loading) {
        return <div style={styles.loading}>Loading tickets...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>TICKETS</h1>
                <p style={styles.subtitle}>Showing {filteredTickets.length} of {tickets.length} tickets</p>
            </div>

            <div style={styles.controls}>
                <input
                    type="text"
                    placeholder="Search by title or code..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={styles.searchInput}
                />
                
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={styles.select}
                >
                    <option value="">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PAUSED">Paused</option>
                    <option value="CLOSED">Closed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REOPENED">Reopened</option>
                </select>

                <button onClick={loadTickets} style={styles.refreshBtn}>
                    Refresh
                </button>

                {(userRole === 'Editor' || userRole === 'Admin') && (
                    <button style={styles.addBtn}>+ Add New Ticket</button>
                )}
            </div>

            {filteredTickets.length === 0 ? (
                <div style={styles.emptyState}>
                    <p>No tickets found</p>
                    {searchText && <p style={{color: '#999'}}>Try a different search term</p>}
                </div>
            ) : (
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>External Code</th>
                                <th style={styles.th}>Title</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Created By</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTickets.map((ticket) => (
                                <tr key={ticket.id} style={styles.tr}>
                                    <td style={styles.td}>#{ticket.id}</td>
                                    <td style={styles.td}>{ticket.externalCode}</td>
                                    <td style={styles.td}>
                                        {ticket.title}
                                        {ticket.isBlocking && (
                                            <span style={styles.blockingBadge}>BLOCKING</span>
                                        )}
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.statusBadge}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{ticket.createdByName}</td>
                                    <td style={styles.td}>
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            <button style={styles.actionBtn} title="View">
                                                <Eye size={16} />
                                            </button>
                                            {(userRole === 'Editor' || userRole === 'Admin') && (
                                                <button style={styles.actionBtn} title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                            )}
                                            {userRole === 'Admin' && (
                                                <button style={{...styles.actionBtn, color: '#d32f2f'}} title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
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
    loading: {
        textAlign: 'center',
        padding: '3rem',
        fontSize: '1.2rem',
        color: '#666',
    },
    header: {
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
        marginTop: '0.5rem',
    },
    controls: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
    },
    searchInput: {
        padding: '0.6rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        flex: 1,
        minWidth: '250px',
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
    },
    emptyState: {
        textAlign: 'center',
        padding: '3rem',
        background: 'white',
        borderRadius: '8px',
    },
    tableWrapper: {
        background: 'white',
        borderRadius: '8px',
        overflow: 'auto',
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
    },
    tr: {
        borderBottom: '1px solid #dee2e6',
    },
    td: {
        padding: '1rem',
    },
    blockingBadge: {
        marginLeft: '0.5rem',
        padding: '0.2rem 0.5rem',
        background: '#ffebee',
        color: '#c62828',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '600',
    },
    statusBadge: {
        padding: '0.3rem 0.8rem',
        background: '#e3f2fd',
        color: '#1976d2',
        borderRadius: '12px',
        fontSize: '0.85rem',
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

