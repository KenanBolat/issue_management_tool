import { useState, useEffect } from "react";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import TicketsTable from "./components/TicketsTable.jsx";
import Navigation from "./components/Navigation.jsx";
import TicketDetail from "./components/TicketDetail.jsx";
import UserList from "./components/UserList.jsx";
import UserForm from "./components/UserForm.jsx";

function App() {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState('new');
    const [currentUserId, setCurrentUserId] = useState(null);


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

    const handleViewUser = (userId) => {
        console.log("Viewing user:", userId);
        setSelectedUserId(userId);
        setCurrentPage('user-detail');
    };

    const handleEditUser = (userId) => {
        console.log("Editing user:", userId);
        setCurrentUserId(userId);
        setSelectedUserId(userId);
        setCurrentPage('user-form');
    }

    const handleCreateUser = () => {
        setSelectedUserId('new');
        setCurrentPage('user-form');
    };

    const handleManagePermissions = (userId) => {
        setSelectedUserId(userId);
        setCurrentPage('user-permissions');
    };

     const handleCloseUserForm = () => {
        setSelectedUserId(null);
        setCurrentPage('users');
    };



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

                {currentPage === 'users' && (
                    <UserList 
                        onViewUser={handleViewUser}
                        onEditUser={handleEditUser}
                        onCreateUser={handleCreateUser}
                        onManagePermissions={handleManagePermissions}
                    />
                )}

                 {currentPage === 'user-form' && (
                    <UserForm 
                        userId={selectedUserId}
                        onClose={handleCloseUserForm}
                        onSave={() => {
                            handleCloseUserForm();
                            // Optionally refresh user list
                        }}
                    />
                )}

            </main>
        </div>
    );
}

export default App;

