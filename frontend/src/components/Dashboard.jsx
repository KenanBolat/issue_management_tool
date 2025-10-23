import { useState, useEffect } from "react";
import { dashboardAPI } from "../../services/api";
import {
    LineChart, Line, XAxis,
    YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, BarChart, Bar} from "recharts";

import { Clock, CheckCircle, AlertCircle, Users } from "lucide-react";


export default function Dashboard() {
    const [stats, setStats] = useState({});
    const [ongoingTickets, setOngoingTickets] = useState([]);
    const [recentTickets, setRecentTickets] = useState([]);
    const [loading, setLoading] = useState([]);


    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const [dashResponse, allTicketRespons] = await Promise.all([
                dashboardAPI.get(),
                ticketAPI.getAll()
            ]);
            setStats(dashResponse.data.statusCounts);
            setOngoingTickets(dashResponse.data.ongoingTickets);

            // Get recent tickets (sorted by Date Created )
            const allTickets = allTicketRespons.data.items || allTicketRespons.data;
            const recent = allTickets
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);
            setRecentTickets(recent);

        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };
    const getStatusColor = (status) => {
        const colors = {
            OPEN: '#2196f3',
            CONFIRMED: '#ff9800',
            PAUSED: '#9c27b0',
            CLOSED: '#4caf50',
            CANCELLED: '#f44336',
            REOPENED: '#e91e63',
        };
        return colors[status] || '#757575';
    };

    const getStatusBadgeStyle = (status) => ({
        ...styles.statusBadge,
        backgroundColor: getStatusColor(status) + '20',
        color: getStatusColor(status),
    });

    // Prepare chart data from stats 

    const chartData = Object.entries(stats).map(([status, count]) => ({
        name: status,
        count: count,
    }));

    const userName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");


    if (loading) {
        return <div style={styles.loading} >Loading dashboard...</div>;
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Dashboard</h1>
                    <p style={styles.subtitle}>Welcome back, {userName}!</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, borderLeft: '4px solid #2196f3' }}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#e3f2fd' }}>
                        <Clock size={24} color="#2196f3" />
                    </div>
                    <div>
                        <div style={styles.statValue}>{stats.OPEN || 0}</div>
                        <div style={styles.statLabel}>Open Tickets</div>
                    </div>
                </div>

                <div style={{ ...styles.statCard, borderLeft: '4px solid #ff9800' }}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#fff3e0' }}>
                        <AlertCircle size={24} color="#ff9800" />
                    </div>
                    <div>
                        <div style={styles.statValue}>{stats.CONFIRMED || 0}</div>
                        <div style={styles.statLabel}>Confirmed</div>
                    </div>
                </div>

                <div style={{ ...styles.statCard, borderLeft: '4px solid #4caf50' }}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#e8f5e9' }}>
                        <CheckCircle size={24} color="#4caf50" />
                    </div>
                    <div>
                        <div style={styles.statValue}>{stats.CLOSED || 0}</div>
                        <div style={styles.statLabel}>Closed</div>
                    </div>
                </div>

                <div style={{ ...styles.statCard, borderLeft: '4px solid #9c27b0' }}>
                    <div style={{ ...styles.statIcon, backgroundColor: '#f3e5f5' }}>
                        <Users size={24} color="#9c27b0" />
                    </div>
                    <div>
                        <div style={styles.statValue}>
                            {Object.values(stats).reduce((a, b) => a + b, 0)}
                        </div>
                        <div style={styles.statLabel}>Total Tickets</div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div style={styles.chartsRow}>
                <div style={styles.chartCard}>
                    <h3 style={styles.cardTitle}>Tickets by Status</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#667eea" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={styles.chartCard}>
                    <h3 style={styles.cardTitle}>Ticket Trends</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#4caf50" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={styles.contentGrid}>
                {/* Ongoing Tickets */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Ongoing Issues</h3>
                        <span style={styles.badge}>{ongoingTickets.length} active</span>
                    </div>
                    <div style={styles.taskList}>
                        {ongoingTickets.length === 0 ? (
                            <div style={styles.emptyState}>No ongoing tickets</div>
                        ) : (
                            ongoingTickets.map((ticket) => (
                                <div key={ticket.id} style={styles.taskItem}>
                                    <div style={styles.taskLeft}>
                                        <input type="checkbox" style={styles.checkbox} />
                                        <div>
                                            <div style={styles.taskTitle}>{ticket.title}</div>
                                            <div style={styles.taskMeta}>
                                                {ticket.externalCode} • {ticket.createdByName}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles.taskRight}>
                                        <span style={getStatusBadgeStyle(ticket.status)}>
                                            {ticket.status}
                                        </span>
                                        {ticket.isBlocking && (
                                            <span style={styles.blockingBadge}>BLOCKING</span>
                                        )}
                                        {ticket.hasCICompleted && (
                                            <span style={styles.ciBadge}>✓ CI</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Tickets */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Recent Tickets</h3>
                        <button
                            onClick={() => window.location.href = '#/tickets'}
                            style={styles.viewAllBtn}
                        >
                            View All
                        </button>
                    </div>
                    <div style={styles.taskList}>
                        {recentTickets.map((ticket) => (
                            <div key={ticket.id} style={styles.taskItem}>
                                <div style={styles.taskLeft}>
                                    <div style={{
                                        ...styles.avatar,
                                        backgroundColor: getStatusColor(ticket.status)
                                    }}>
                                        {ticket.createdByName.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={styles.taskTitle}>{ticket.title}</div>
                                        <div style={styles.taskMeta}>
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <span style={getStatusBadgeStyle(ticket.status)}>
                                    {ticket.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            {(userRole === 'Editor' || userRole === 'Admin') && (
                <div style={styles.quickActions}>
                    <button style={styles.actionButton}>+ Create New Ticket</button>
                    <button style={{ ...styles.actionButton, ...styles.secondaryButton }}>
                        View All Tickets
                    </button>
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
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
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
        fontSize: '2rem',
        fontWeight: 'bold',
        margin: 0,
        color: '#333',
    },
    subtitle: {
        color: '#666',
        marginTop: '0.5rem',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    statCard: {
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    statIcon: {
        width: '50px',
        height: '50px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: '0.9rem',
        color: '#666',
        marginTop: '0.25rem',
    },
    chartsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    chartCard: {
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    card: {
        background: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #eee',
    },
    cardTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        margin: 0,
        color: '#333',
    },
    badge: {
        padding: '0.25rem 0.75rem',
        background: '#e3f2fd',
        color: '#1976d2',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: '500',
    },
    viewAllBtn: {
        padding: '0.4rem 1rem',
        background: 'transparent',
        color: '#667eea',
        border: '1px solid #667eea',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    taskList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    emptyState: {
        textAlign: 'center',
        padding: '2rem',
        color: '#999',
    },
    taskItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        background: '#fafafa',
        borderRadius: '6px',
        transition: 'background 0.2s',
    },
    taskLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flex: 1,
    },
    checkbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
    },
    taskTitle: {
        fontWeight: '500',
        color: '#333',
        marginBottom: '0.25rem',
    },
    taskMeta: {
        fontSize: '0.85rem',
        color: '#666',
    },
    taskRight: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1.1rem',
    },
    statusBadge: {
        padding: '0.3rem 0.8rem',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '500',
    },
    blockingBadge: {
        padding: '0.2rem 0.6rem',
        background: '#ffebee',
        color: '#c62828',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '600',
    },
    ciBadge: {
        padding: '0.2rem 0.6rem',
        background: '#e8f5e9',
        color: '#388e3c',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '500',
    },
    quickActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
    },
    actionButton: {
        padding: '0.8rem 2rem',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '1rem',
    },
    secondaryButton: {
        background: 'white',
        color: '#667eea',
        border: '2px solid #667eea',
    },
};