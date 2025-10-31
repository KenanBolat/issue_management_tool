import { LayoutDashboard, List, LogOut } from "lucide-react";

export default function Navigation({ currentPage, onNavigate }) {

    const userName = localStorage.getItem("displayName") || "DisplayName";
    const userRole = localStorage.getItem("role") || "UserRole";


    return (
        <nav style={styles.nav}>
            <div style={styles.brand}>
                <span style={styles.brandIcon}>🛰️</span>
                <span style={styles.brandText}>Satellite Ticket Tracker | </span>
                <span style={styles.brandIcon}>SatSuMa</span>
            </div>
            <div style={styles.menu}>
                <button
                    onClick={() => onNavigate('dashboard')}
                    style={{
                        ...styles.menuItem,
                        ...(currentPage === 'dashboard' ? styles.activeMenuItem : {})
                    }}
                >
                    <LayoutDashboard size={18} />
                    Dashboard </button>
                <button
                    onClick={() => onNavigate('tickets')}
                    style={{
                        ...styles.menuItem,
                        ...(currentPage === 'tickets' ? styles.activeMenuItem : {})
                    }}
                >
                    <List size={18} />
                    Tickets </button>

                {userRole === 'Admin' && (
                    <button 
                    onClick={() => onNavigate('users')}
                    style={{...styles.menuItem, ...(currentPage === 'users' ? styles.activeMenuItem: {})}}
                    >
                        Users
                    </button>
                )}
            </div>
            <div style={styles.userSection}>
                <div style={styles.userInfo}>
                    <div style={styles.userName}>{userName}</div>
                    <div style={styles.userRole}>{userRole}</div>
                </div>
                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                    }}
                    style={styles.logoutButton}
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    logo: {
        fontSize: '1.8rem',
    },
    brandText: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#333',
    },
    menu: {
        display: 'flex',
        gap: '0.5rem',
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1.2rem',
        background: 'transparent',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        color: '#666',
        fontWeight: '500',
        transition: 'all 0.2s',
    },
    activeMenuItem: {
        background: '#667eea',
        color: 'white',
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    userInfo: {
        textAlign: 'right',
    },
    userName: {
        fontWeight: '600',
        color: '#333',
        fontSize: '0.95rem',
    },
    userRole: {
        fontSize: '0.8rem',
        color: '#666',
    },
    logoutBtn: {
        padding: '0.6rem',
        background: '#f5f5f5',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        color: '#666',
        display: 'flex',
        alignItems: 'center',
    },
};
