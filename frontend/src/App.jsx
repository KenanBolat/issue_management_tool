import { useState, useEffect, use } from "react";
import Login from "./components/Login.jsx";
import TicketsTable from "./components/TicketsTable.jsx";

function App() {
  
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem("token"); 
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);
  
    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    return (
        <div>
            {isAuthenticated ? (
                <TicketsTable />
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </div>
    );
}

export default App;

