import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { ticketsAPI } from '../../services/api';

export default function TicketCalendar({ onTicketClick }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);

    // Get calendar data for current month
    useEffect(() => {
        loadTicketsForMonth();
    }, [currentDate]);

    const loadTicketsForMonth = async () => {
        setLoading(true);
        try {
            // Get all tickets (you might want to add date filtering to the API)
            const response = await ticketsAPI.getAll();
            setTickets(response.data);
        } catch (error) {
            console.error('Error loading tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calendar navigation
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Get month information
    const getMonthInfo = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

        return { year, month, daysInMonth, startingDayOfWeek };
    };

    // Get tickets for a specific date
    const getTicketsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        return tickets.filter(ticket => {
            // Check if ticket was created on this date
            const createdDate = new Date(ticket.createdAt).toISOString().split('T')[0];
            if (createdDate === dateStr) return true;

            // Check if ticket has actions on this date
            if (ticket.lastActivityDate) {
                const activityDate = new Date(ticket.lastActivityDate).toISOString().split('T')[0];
                if (activityDate === dateStr) return true;
            }

            return false;
        });
    };

    // Render calendar grid
    const renderCalendar = () => {
        const { year, month, daysInMonth, startingDayOfWeek } = getMonthInfo();
        const weeks = [];
        let currentWeek = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            currentWeek.push(
                <div key={`empty-${i}`} style={styles.emptyDay} />
            );
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayTickets = getTicketsForDate(date);
            const isToday = isSameDay(date, new Date());

            currentWeek.push(
                <div 
                    key={day} 
                    style={{
                        ...styles.dayCell,
                        ...(isToday ? styles.todayCell : {})
                    }}
                >
                    <div style={styles.dayNumber}>{day}</div>
                    <div style={styles.ticketsContainer}>
                        {dayTickets.slice(0, 3).map(ticket => (
                            <div
                                key={ticket.id}
                                style={{
                                    ...styles.ticketItem,
                                    ...(ticket.isBlocking ? styles.criticalTicket : styles.normalTicket)
                                }}
                                onClick={() => onTicketClick?.(ticket.id)}
                            >
                                <span style={styles.ticketCode}>
                                    {ticket.externalCode}
                                </span>
                                {ticket.isBlocking && (
                                    <AlertCircle size={12} style={styles.criticalIcon} />
                                )}
                            </div>
                        ))}
                        {dayTickets.length > 3 && (
                            <div style={styles.moreTickets}>
                                +{dayTickets.length - 3} daha
                            </div>
                        )}
                    </div>
                </div>
            );

            // Start a new week after Saturday
            if (currentWeek.length === 7) {
                weeks.push(
                    <div key={`week-${weeks.length}`} style={styles.weekRow}>
                        {currentWeek}
                    </div>
                );
                currentWeek = [];
            }
        }

        // Add empty cells for remaining days in the last week
        while (currentWeek.length > 0 && currentWeek.length < 7) {
            currentWeek.push(
                <div key={`empty-end-${currentWeek.length}`} style={styles.emptyDay} />
            );
        }

        // Add the last week if it has any days
        if (currentWeek.length > 0) {
            weeks.push(
                <div key={`week-${weeks.length}`} style={styles.weekRow}>
                    {currentWeek}
                </div>
            );
        }

        return weeks;
    };

    const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    };

    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

    return (
        <div style={styles.container}>
            {/* Calendar Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <CalendarIcon size={24} style={{ color: '#667eea' }} />
                    <h2 style={styles.title}>
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                </div>

                <div style={styles.headerRight}>
                    <button onClick={goToToday} style={styles.todayButton}>
                        Bugün
                    </button>
                    <button onClick={goToPreviousMonth} style={styles.navButton}>
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={goToNextMonth} style={styles.navButton}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div style={styles.legend}>
                <div style={styles.legendItem}>
                    <div style={{...styles.legendDot, backgroundColor: '#2196f3'}} />
                    <span>Normal Arıza</span>
                </div>
                <div style={styles.legendItem}>
                    <div style={{...styles.legendDot, backgroundColor: '#f44336'}} />
                    <span>Kritik Arıza</span>
                </div>
            </div>

            {/* Calendar Grid */}
            <div style={styles.calendarContainer}>
                {/* Day names header */}
                <div style={styles.weekRow}>
                    {dayNames.map(day => (
                        <div key={day} style={styles.dayName}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                {loading ? (
                    <div style={styles.loading}>Yükleniyor...</div>
                ) : (
                    renderCalendar()
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #f0f0f0',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#333',
        margin: 0,
    },
    headerRight: {
        display: 'flex',
        gap: '0.5rem',
    },
    todayButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'all 0.2s',
    },
    navButton: {
        padding: '0.5rem',
        backgroundColor: '#f5f5f5',
        color: '#666',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    },
    legend: {
        display: 'flex',
        gap: '1.5rem',
        marginBottom: '1rem',
        padding: '0.75rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: '#666',
    },
    legendDot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
    },
    calendarContainer: {
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    weekRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        borderBottom: '1px solid #e0e0e0',
    },
    dayName: {
        padding: '1rem',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '0.85rem',
        color: '#666',
        backgroundColor: '#f9f9f9',
        borderRight: '1px solid #e0e0e0',
    },
    dayCell: {
        minHeight: '120px',
        padding: '0.5rem',
        borderRight: '1px solid #e0e0e0',
        backgroundColor: 'white',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    todayCell: {
        backgroundColor: '#f0f7ff',
    },
    emptyDay: {
        minHeight: '120px',
        backgroundColor: '#fafafa',
        borderRight: '1px solid #e0e0e0',
    },
    dayNumber: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '0.5rem',
    },
    ticketsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    ticketItem: {
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.25rem',
        transition: 'all 0.2s',
    },
    normalTicket: {
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        borderLeft: '3px solid #2196f3',
    },
    criticalTicket: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        borderLeft: '3px solid #f44336',
    },
    ticketCode: {
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    criticalIcon: {
        flexShrink: 0,
        color: '#f44336',
    },
    moreTickets: {
        fontSize: '0.7rem',
        color: '#999',
        padding: '0.25rem 0.5rem',
        fontStyle: 'italic',
    },
    loading: {
        padding: '3rem',
        textAlign: 'center',
        color: '#999',
        fontSize: '1rem',
    },
};