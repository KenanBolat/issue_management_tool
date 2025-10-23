import { useState, useEffect, use } from "react";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import TicketsTable from "./components/TicketsTable.jsx";
import Navigation from "./components/Navigation.jsx";

function App() {
  
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');

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

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div style={styles.appContainer}>
            <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
            {currentPage === 'dashboard' ? <Dashboard /> : <TicketsTable />}
            
            <main style={styles.mainContent}>
                {currentPage === 'dashboard' && <Dashboard />}
                {currentPage === 'tickets' && <TicketsTable />}
            </main>
        </div>
    );
}

export default App;

