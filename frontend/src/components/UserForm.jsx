import {useState, useEffect} from 'react';
import {userApi} from '../../services/api';
import {X, Save, Eye, EyeOff} from 'lucide-react';


export default function UserForm({userId, onClose, onSave}) {  
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [militaryRanks, setMilitaryRanks] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: '',
        role: 'Viewer',
        affiliation: '',
        department: '',
        militaryRankId: null,
        phoneNumber: '',
    });

    
    const currentUserRole = localStorage.getItem('role'); // Assuming role is stored in localStorage
    const isAdmin = currentUserRole === 'Admin';
    const isNewUser = !userId || userId === 'new';
    const isEditingSelf = userId && userId === localStorage.getItem('userId');

    useEffect(() => {
        loadMilitaryRanks();
        if (!isNewUser) {
            loadUserData();
        }
    }, [userId]);

    const loadMilitaryRanks = async () => {
        try {
            const response = await userApi.getRanks();
            setMilitaryRanks(response.data);
        } catch (error) {
            console.error('Failed to load military ranks', error);
        }
    };

    const loadUserData = async () => {
        setLoading(true);
        try {
            const response = await userApi.getById(userId);
            const user = response.data;
            setFormData({
                email: user.email,
                password: '',
                displayName: user.displayName,
                role: user.role,
                affiliation: user.affiliation || '',
                department: user.department || '',
                militaryRankId: user.militaryRankId || null,
                phoneNumber: user.phoneNumber || '',
            });
        } catch (error) {
            console.error('Failed to load user data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value})) ;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.email || !formData.displayName) {
            alert('Email and Display Name are required.');
            return;
        }
        
        if (isNewUser && !formData.password) {
            alert('Password is required for new users.');
            return;
        }

        try {
            setSaving(true);
            if (isNewUser) {
                await userApi.create(formData);
                alert('User created successfully.');
            } else {
                await userApi.update(userId, formData);
                alert('User updated successfully.');
            }

            if (onSave) onSave();
            if (onClose) onClose();
        } catch (error) {
            console.error('Failed to save user data', error);
            alert(error.response?.data?.message || 'An error occurred while saving user data.');
        } finally {
            setSaving(false);
        }
    };

    const isMilitaryAffiliation = () => {
        return ['Airforce', 'Navy', 'Army', 'Marines', 'CoastGuard'].includes(formData.affiliation);
    }
    
    if (loading) {
        return <div style={styles.loading}>Loading user data...</div>;
    }

    if (!isAdmin && !isEditingSelf) {
        return (
            <div style={styles.container}>
                <div style={styles.noAccess}>
                    <h2>Access Denied</h2>
                    <p>You can only edit your own profile.</p>
                    <button onClick={onClose} style={styles.button}>Close</button>
                </div>
            </div>
        );
    }

  return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    {isNewUser ? 'Create New User' : 'Edit User'}
                </h1>
                <button onClick={onClose} style={styles.closeButton}>
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGrid}>
                    {/* Left Column */}
                    <div style={styles.formSection}>
                        <h2 style={styles.sectionTitle}>Account Information</h2>
                        
                        <div style={styles.formRow}>
                            <label style={styles.label}>
                                Email <span style={styles.required}>*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                style={styles.input}
                                disabled={!isNewUser}
                                required
                            />
                        </div>

                        {isNewUser && (
                            <div style={styles.formRow}>
                                <label style={styles.label}>
                                    Password <span style={styles.required}>*</span>
                                </label>
                                <div style={styles.passwordInputGroup}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        style={styles.input}
                                        required={isNewUser}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={styles.passwordToggle}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={styles.formRow}>
                            <label style={styles.label}>
                                Display Name <span style={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.displayName}
                                onChange={(e) => handleInputChange('displayName', e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formRow}>
                            <label style={styles.label}>
                                Role <span style={styles.required}>*</span>
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => handleInputChange('role', e.target.value)}
                                style={styles.select}
                                disabled={!isAdmin}
                            >
                                <option value="Viewer">Viewer</option>
                                <option value="Editor">Editor</option>
                                <option value="Admin">Admin</option>
                            </select>
                            {!isAdmin && (
                                <p style={styles.hint}>Only administrators can change roles</p>
                            )}
                        </div>

                        <div style={styles.formRow}>
                            <label style={styles.label}>Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                style={styles.input}
                                placeholder="+90 555 123 45 67"
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div style={styles.formSection}>
                        <h2 style={styles.sectionTitle}>Organization Information</h2>
                        
                        <div style={styles.formRow}>
                            <label style={styles.label}>
                                Affiliation <span style={styles.required}>*</span>
                            </label>
                            <select
                                value={formData.affiliation}
                                onChange={(e) => handleInputChange('affiliation', e.target.value)}
                                style={styles.select}
                                disabled={!isAdmin && !isNewUser}
                            >
                                <option value="Airforce">Airforce (Hava Kuvvetleri)</option>
                                <option value="Navy">Navy (Deniz Kuvvetleri)</option>
                                <option value="Army">Army (Kara Kuvvetleri)</option>
                                <option value="Marines">Marines (Deniz Piyade)</option>
                                <option value="CoastGuard">Coast Guard (Sahil Güvenlik)</option>
                                <option value="Internal">Internal</option>
                                <option value="External">External</option>
                                <option value="Contractor">Contractor</option>
                                <option value="Subcontractor">Subcontractor</option>
                                <option value="Partner">Partner</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {isMilitaryAffiliation() && (
                            <div style={styles.formRow}>
                                <label style={styles.label}>Military Rank</label>
                                <select
                                    value={formData.militaryRankId || ''}
                                    onChange={(e) => handleInputChange('militaryRankId', 
                                        e.target.value ? parseInt(e.target.value) : null)}
                                    style={styles.select}
                                >
                                    <option value="">Select Rank</option>
                                    {militaryRanks.map((rank) => (
                                        <option key={rank.id} value={rank.id}>
                                            {rank.displayName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={styles.formRow}>
                            <label style={styles.label}>Department</label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) => handleInputChange('department', e.target.value)}
                                style={styles.input}
                                placeholder="e.g., Engineering, Operations"
                            />
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.infoBox}>
                                <strong>Account Type:</strong> {formData.role}<br/>
                                <strong>Organization:</strong> {formData.affiliation}
                                {isMilitaryAffiliation() && formData.militaryRankId && (
                                    <>
                                        <br/><strong>Military Service:</strong> Yes
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.formActions}>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        style={styles.cancelButton}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        style={styles.saveButton}
                        disabled={saving}
                    >
                        <Save size={16} />
                        {saving ? 'Saving...' : (isNewUser ? 'Create User' : 'Update User')}
                    </button>
                </div>
            </form>
        </div>
    );
}

const styles = {
    container: {
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: 0,
    },
    closeButton: {
        padding: '0.6rem',
        backgroundColor: '#f5f5f5',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
    },
    form: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '2rem',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
    },
    formSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    sectionTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#333',
        borderBottom: '2px solid #667eea',
        paddingBottom: '0.5rem',
    },
    formRow: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '0.4rem',
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#555',
    },
    required: {
        color: '#d32f2f',
    },
    input: {
        padding: '0.6rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.9rem',
    },
    select: {
        padding: '0.6rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.9rem',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    passwordInputGroup: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    passwordToggle: {
        position: 'absolute',
        right: '0.5rem',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#666',
        display: 'flex',
        alignItems: 'center',
    },
    hint: {
        fontSize: '0.8rem',
        color: '#999',
        marginTop: '0.3rem',
        fontStyle: 'italic',
    },
    infoBox: {
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '0.9rem',
        lineHeight: '1.8',
    },
    formActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '1px solid #eee',
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1.2rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    cancelButton: {
        padding: '0.6rem 1.2rem',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    saveButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1.2rem',
        backgroundColor: '#4caf50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    loading: {
        textAlign: 'center',
        padding: '3rem',
        fontSize: '1.2rem',
        color: '#666',
    },
    noAccess: {
        textAlign: 'center',
        padding: '3rem',
        background: 'white',
        borderRadius: '8px',
    },
};
