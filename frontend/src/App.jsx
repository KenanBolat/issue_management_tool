import { useState, useEffect } from "react";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import TicketsTable from "./components/TicketsTable.jsx";
import Navigation from "./components/Navigation.jsx";
import TicketDetail from "./components/TicketDetail.jsx";

function App() {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedTicketId, setSelectedTicketId] = useState(null);


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = () => { 
        setIsAuthenticated(true);
    };

    const handleNavigate = (page) => {
        setCurrentPage(page);
    };

    const handleViewTicket = (ticketId) => {
        // console.log("Viewing ticket:", ticketId);
        setSelectedTicketId(ticketId);
        setCurrentPage('ticket-detail');
    }

    const handleEditTicket = (ticketId) => {
        // console.log("Editing ticket:", ticketId);
        setSelectedTicketId(ticketId);
        setCurrentPage('ticket-detail');
    }

    const handleCreateTicket = () => {
        console.log("Creating new ticket");
        setSelectedTicketId('new');
        setCurrentPage('ticket-detail');
    }   



    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div >
            <Navigation currentPage={currentPage} onNavigate={handleNavigate} />


            <main>
                {currentPage === 'dashboard' && <Dashboard />}
                {currentPage === 'tickets' && (
                    <TicketsTable
                        onViewTicket={handleViewTicket}
                        onEditTicket={handleEditTicket}
                        onCreateTicket={handleCreateTicket}
                    />)}
                {currentPage === 'ticket-detail' && (<TicketDetail ticketId={selectedTicketId} />)}

            </main>
        </div>
    );
}

export default App;

