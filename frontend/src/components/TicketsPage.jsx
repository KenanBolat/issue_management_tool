import { useState } from 'react';
import TicketsTable from '../components/tickets/TicketsTable';
import TicketDetail from '../components/tickets/TicketDetail';

export default function TicketsPage() {
    const [view, setView] = useState('table'); // 'table' or 'detail'
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleViewTicket = (ticketId) => {
        setSelectedTicketId(ticketId);
        setView('detail');
    };

    const handleEditTicket = (ticketId) => {
        setSelectedTicketId(ticketId);
        setView('detail');
    };

    const handleCreateTicket = () => {
        setSelectedTicketId('new');
        setView('detail');
    };

    const handleCloseDetail = () => {
        setView('table');
        setSelectedTicketId(null);
        setRefreshKey(prev => prev + 1); // Trigger table refresh
    };

    return (
        <div>
            {view === 'table' ? (
                <TicketsTable
                    key={refreshKey} // Force re-render when refreshKey changes
                    onViewTicket={handleViewTicket}
                    onEditTicket={handleEditTicket}
                    onCreateTicket={handleCreateTicket}
                />
            ) : (
                <TicketDetail 
                    ticketId={selectedTicketId} 
                    onClose={handleCloseDetail} 
                />
            )}
        </div>
    );
}