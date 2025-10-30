import { useState } from "react";
import { authAPI } from "../../services/api.jsx";


export default function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await authAPI.login(email, password);
            const { token, displayName, role } = response.data;
            debugger; 
            localStorage.setItem("token", token);
            localStorage.setItem("displayName", displayName);
            localStorage.setItem("role", role);

            onLogin(response.data );    
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };
 return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🛰️ Satellite Ticket Tracker</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={styles.hint}>
          <p><strong>Test Accounts:</strong></p>
          <p>Admin: admin@example.com / adminpasswd</p>
          <p>Editor: editor@example.com / editorpasswd</p>
          <p>Viewer: viewer@example.com / viewerpasswd</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  card: {
    background: 'white',
    padding: '3rem',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.8rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  button: {
    padding: '0.8rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  error: {
    padding: '0.8rem',
    background: '#fee',
    color: '#c33',
    borderRadius: '4px',
  },
  hint: {
    marginTop: '2rem',
    padding: '1rem',
    background: '#f5f5f5',
    borderRadius: '4px',
    fontSize: '0.85rem',
  },
};