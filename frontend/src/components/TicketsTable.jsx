import { useState, useEffect } from "react";
import { ticketsAPI } from "../../services/api.jsx";
import { Edit, Trash2, Eye } from "lucide-react";


export default function TicketsTable() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    useEffect(() => {
        fetchTickets();
    }, [statusFilter]);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const response = await ticketsAPI.getAll(statusFilter || null);
            setTickets(response.data.items || response.data);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

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

    const filteredTickets = tickets
        .filter(ticket =>
            ticket.title.toLowerCase().includes(filter.toLowerCase()) ||
            ticket.externalCode.toLowerCase().includes(filter.toLowerCase())
        )
        .sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            if (sortField === "createdAt") {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (sortOrder === "asc") {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    const userName = localStorage.getItem("userName"); 
    const userRole = localStorage.getItem("userRole");
     return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>TICKETS</h1>
          <p style={styles.subtitle}>Showing {filteredTickets.length} of {tickets.length} tickets</p>
        </div>
        <div style={styles.userInfo}>
          <span>{userName} ({userRole})</span>
          <button onClick={() => {
            localStorage.clear();
            window.location.reload();
          }} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.controls}>
        <div style={styles.filterGroup}>
          <input
            type="text"
            placeholder="Search tickets..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
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
        </div>

        {(userRole === 'Editor' || userRole === 'Admin') && (
          <button style={styles.addBtn}>
            + Add New Ticket
          </button>
        )}
      </div>

      {loading ? (
        <div style={styles.loading}>Loading tickets...</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th} onClick={() => handleSort('id')}>
                  Ticket ID {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th} onClick={() => handleSort('externalCode')}>
                  External Code {sortField === 'externalCode' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th} onClick={() => handleSort('title')}>
                  Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th} onClick={() => handleSort('createdAt')}>
                  Date {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created By</th>
                <th style={styles.th}>CI Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} style={styles.tr}>
                  <td style={styles.td}>#{ticket.id}</td>
                  <td style={styles.td}>{ticket.externalCode}</td>
                  <td style={styles.td}>
                    <div style={styles.titleCell}>
                      {ticket.title}
                      {ticket.isBlocking && (
                        <span style={styles.blockingBadge}>BLOCKING</span>
                      )}
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
                      {ticket.status}
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
                      <button style={styles.actionBtn} title="View Details">
                        <Eye size={16} />
                      </button>
                      {(userRole === 'Editor' || userRole === 'Admin') && (
                        <>
                          <button style={styles.actionBtn} title="Edit">
                            <Edit size={16} />
                          </button>
                          {userRole === 'Admin' && (
                            <button style={{...styles.actionBtn, color: '#d32f2f'}} title="Delete">
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
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    background: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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