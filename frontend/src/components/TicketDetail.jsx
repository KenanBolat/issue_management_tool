import { useState, useEffect } from "react";
import { ticketsAPI } from "../../services/api";
import { X, Save, Send, FileText, MessageSquare, History, AlertCircle } from "lucide-react";

export default function TicketDetail({ ticketId, onClose }) {
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        externalCode: '',
        title: '',
        description: '',
        isBlocking: false,
        status: 'OPEN',
        confirmationStatus: null,
        technicalReportRequired: false,
        ciId: null,
        componentId: null,
        subsystemId: null,
        systemId: null,
        itemDescription: '',
        itemId: '',
        itemSerialNo: '',
    });

    // Comments and actions
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);
    const [actions, setActions] = useState([]);
    const [activeTab, setActiveTab] = useState('details');

    const userRole = localStorage.getItem("role");
    const isReadOnly = userRole === 'Viewer';
    const canEdit = userRole === 'Editor' || userRole === 'Admin';
    const isNewTicket = !ticketId || ticketId === 'new';

    useEffect(() => {
        if (!isNewTicket) {
            loadTicketDetails();
        } else {
            setLoading(false);
        }
    }, [ticketId]);

    const loadTicketDetails = async () => {
        try {
            setLoading(true);
            const response = await ticketsAPI.getById(ticketId);
            const ticketData = response.data;

            setTicket(ticketData);
            setFormData({
                externalCode: ticketData.externalCode || '',
                title: ticketData.title || '',
                description: ticketData.description || '',
                isBlocking: ticketData.isBlocking || false,
                status: ticketData.status || 'OPEN',
                confirmationStatus: ticketData.confirmationStatus || null,
                technicalReportRequired: ticketData.technicalReportRequired || false,
                ciId: ticketData.ciId,
                componentId: ticketData.componentId,
                subsystemId: ticketData.subsystemId,
                systemId: ticketData.systemId,
                itemDescription: ticketData.itemDescription || '',
                itemId: ticketData.itemId || '',
                itemSerialNo: ticketData.itemSerialNo || '',
            });

            setComments(ticketData.comments || []);
            setActions(ticketData.actions || []);
        } catch (error) {
            console.error("Error loading ticket:", error);
            alert("Error loading ticket details");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            alert("Title is required");
            return;
        }

        try {
            setSaving(true);
            if (isNewTicket) {
                const response = await ticketsAPI.create(formData);
                alert("Ticket created successfully");
                if (onClose) onClose();
            } else {
                await ticketsAPI.update(ticketId, formData);
                alert("Ticket updated successfully");
                loadTicketDetails();
            }
        } catch (error) {
            console.error("Error saving ticket:", error);
            alert("Error saving ticket");
        } finally {
            setSaving(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            alert("Comment cannot be empty");
            return;
        }

        try {
            await ticketsAPI.addComment(ticketId, { body: newComment });
            setNewComment('');
            alert("Comment added successfully");
            loadTicketDetails();
        } catch (error) {
            console.error("Error adding comment:", error);
            alert("Error adding comment");
        }
    };

    const handleStatusChange = async (newStatus, notes = '') => {
        if (!window.confirm(`Change status to ${newStatus}?`)) return;

        try {
            await ticketsAPI.changeStatus(ticketId, {
                toStatus: newStatus,
                notes: notes || `Status changed to ${newStatus}`,
                confirmationStatus: formData.confirmationStatus
            });
            alert("Status changed successfully");
            loadTicketDetails();
        } catch (error) {
            console.error("Error changing status:", error);
            alert("Error changing status");
        }
    };

    if (loading) {
        return <div style={styles.loading}>Loading ticket details...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <h1 style={styles.title}>
                        {isNewTicket ? 'New Ticket' : `Ticket #${ticketId}`}
                    </h1>
                    {ticket && (
                        <span style={styles.externalCode}>{formData.externalCode}</span>
                    )}
                </div>
                <div style={styles.headerRight}>
                    {canEdit && (
                        <button
                            onClick={handleSave}
                            style={{ ...styles.button, ...styles.saveButton }}
                            disabled={saving}
                        >
                            <Save size={16} />
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    )}
                    <button onClick={onClose} style={styles.closeButton}>
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div style={styles.content}>
                {/* Left Panel - Main Form */}
                <div style={styles.leftPanel}>
                    {/* Ticket Basic Info Section */}
                    <div style={styles.formSection}>
                        <h2 style={styles.sectionTitle}>Sorun(Ticket) Bilgisi</h2>

                        <div style={styles.formRow}>
                            <label style={styles.label}>
                                Başlık <span style={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                style={styles.input}
                                placeholder="Enter ticket title"
                                disabled={isReadOnly}
                            />
                        </div>

                        <div style={styles.formRow}>
                            <label style={styles.label}>Detay</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                style={{ ...styles.input, ...styles.textarea }}
                                placeholder="Detaylı açıklamayı giriniz..."
                                rows={4}
                                disabled={isReadOnly}
                            />
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.checkboxGroup}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isBlocking}
                                        onChange={(e) => handleInputChange('isBlocking', e.target.checked)}
                                        disabled={isReadOnly}
                                        style={styles.checkbox}
                                    />
                                    <span style={styles.checkboxText}>
                                        <AlertCircle size={16} color="#d32f2f" />
                                        Sorun işin ilerlemesini engelliyor!
                                    </span>
                                </label>

                            </div>
                        </div>
                    </div>

                    {/* Configuration Item Section */}
                    <div style={styles.formSection}>
                        <h2 style={styles.sectionTitle}>
                            Configuration Item (CI) Breakdown
                        </h2>
                        <p style={styles.sectionSubtitle}>
                            Seçim Sırası → Alt Sistem → CI → Komponent üçünde seçiniz / değiştiriniz
                        </p>

                        <div style={styles.hierarchyContainer}>
                            <div style={styles.hierarchyRow}>
                                <div style={styles.hierarchyItem}>
                                    <label style={styles.label}>Sistem</label>
                                    <select
                                        value={formData.systemId || ''}
                                        onChange={(e) => handleInputChange('systemId', e.target.value ? parseInt(e.target.value) : null)}
                                        style={styles.select}
                                        disabled={isReadOnly}
                                    >
                                        <option value="">Select System</option>
                                    </select>
                                </div>

                                <div style={styles.hierarchyItem}>
                                    <label style={styles.label}>Alt Sistem</label>
                                    <select
                                        value={formData.subsystemId || ''}
                                        onChange={(e) => handleInputChange('subsystemId', e.target.value ? parseInt(e.target.value) : null)}
                                        style={styles.select}
                                        disabled={isReadOnly}
                                    >
                                        <option value="">Select Subsystem</option>
                                    </select>
                                </div>
                            </div>

                            <div style={styles.hierarchyRow}>
                                <div style={styles.hierarchyItem}>
                                    <label style={styles.label}>CI (Konfigurasyon Birimi)</label>
                                    <select
                                        value={formData.ciId || ''}
                                        onChange={(e) => handleInputChange('ciId', e.target.value ? parseInt(e.target.value) : null)}
                                        style={styles.select}
                                        disabled={isReadOnly}
                                    >
                                        <option value="">Select CI</option>
                                    </select>
                                </div>

                                <div style={styles.hierarchyItem}>
                                    <label style={styles.label}>Komponent</label>
                                    <select
                                        value={formData.componentId || ''}
                                        onChange={(e) => handleInputChange('componentId', e.target.value ? parseInt(e.target.value) : null)}
                                        style={styles.select}
                                        disabled={isReadOnly}
                                    >
                                        <option value="">Select Component</option>
                                    </select>
                                </div>

                                <div style={styles.formRow}>

                                    <label style={styles.label}>Item Description</label>

                                    <input
                                        type="text"
                                        value={formData.itemDescription}
                                        onChange={(e) => handleInputChange('itemDescription', e.target.value)}
                                        style={styles.input}
                                        placeholder="Item description"
                                        disabled={isReadOnly}
                                    />
                                </div>

                                <div style={styles.formRow}>
                                    <div style={styles.inlineGroup}>
                                        <div style={{ flex: 1 }}>
                                            <label style={styles.label}>Parça No</label>
                                            <input
                                                type="text"
                                                value={formData.itemId}
                                                onChange={(e) => handleInputChange('itemId', e.target.value)}
                                                style={styles.input}
                                                placeholder="Parça No"
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={styles.label}>Seri No</label>
                                            <input
                                                type="text"
                                                value={formData.itemSerialNo}
                                                onChange={(e) => handleInputChange('itemSerialNo', e.target.value)}
                                                style={styles.input}
                                                placeholder="Seri No"
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                        
                                    </div>
                                    
                                </div>
                                
                            </div>
                            <div style={styles.formRow}>
                                            <label style={styles.label}>Parça Tanımı</label>
                                            <textarea  
                                                style={{ ...styles.input, ...styles.textarea }}
                                                rows={3}    
                                                disabled={isReadOnly}   />
                        </div>
                        </div>
                    </div>

                    {/* Item Details Section */}
                    <div style={styles.formSection}>
                        <h2 style={styles.sectionTitle}>Item Details (FORMA BASILMAZ)</h2>




                    </div>

                    {/* Quality Control Section */}
                    <div style={styles.formSection}>
                        <h2 style={styles.sectionTitle}>FAALİYET KONTROLÜ</h2>

                        <div style={styles.inlineGroup}>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>PERSONEL Rütbe & Adı Soyadı</label>
                                <input type="text" style={styles.input} disabled={isReadOnly} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>İLK. KOM. Rütbe & Adı Soyadı</label>
                                <input type="text" style={styles.input} disabled={isReadOnly} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Tarih / Saat</label>
                                <input type="text" style={styles.input} disabled={isReadOnly} />
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <label style={styles.label}>Sonuç (FAAL / GAYRİ FAAL)</label>
                            <textarea
                                style={{ ...styles.input, ...styles.textarea }}
                                rows={2}
                                placeholder="(Gözü faal ise gerçekçesi ve faaliyet için lisezler yazılacaktır)"
                                disabled={isReadOnly}
                            />
                        </div>

                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={formData.technicalReportRequired}
                                onChange={(e) => handleInputChange('technicalReportRequired', e.target.checked)}
                                disabled={isReadOnly}
                                style={styles.checkbox}
                            />
                            <span style={styles.checkboxText}>
                                <FileText size={16} color="#1976d2" />
                                Teknik rapor gerekli!
                            </span>
                        </label>
                    </div>
                </div>

                {/* Right Panel - Status, Comments, History */}
                <div style={styles.rightPanel}>
                    {/* Status Control Panel */}
                    <div style={styles.statusPanel}>
                        <h3 style={styles.panelTitle}>Status Control</h3>

                        <div style={styles.statusBadgeContainer}>
                            <span style={{
                                ...styles.statusBadgeLarge,
                                backgroundColor: getStatusColor(formData.status),
                                color: getStatusTextColor(formData.status)
                            }}>
                                {formData.status}
                            </span>
                        </div>

                        {ticket && canEdit && (
                            <div style={styles.statusActions}>
                                <button
                                    onClick={() => handleStatusChange('CONFIRMED')}
                                    style={{ ...styles.statusButton, ...styles.confirmButton }}
                                    disabled={formData.status === 'CONFIRMED'}
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => handleStatusChange('PAUSED')}
                                    style={{ ...styles.statusButton, ...styles.pauseButton }}
                                    disabled={formData.status === 'PAUSED'}
                                >
                                    Pause
                                </button>
                                <button
                                    onClick={() => handleStatusChange('CLOSED')}
                                    style={{ ...styles.statusButton, ...styles.closeStatusButton }}
                                    disabled={formData.status === 'CLOSED'}
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleStatusChange('REOPENED')}
                                    style={{ ...styles.statusButton, ...styles.reopenButton }}
                                    disabled={formData.status === 'REOPENED'}
                                >
                                    Reopen
                                </button>
                            </div>
                        )}

                        {ticket && (
                            <div style={styles.metadata}>
                                <div style={styles.metadataItem}>
                                    <span style={styles.metadataLabel}>Created:</span>
                                    <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                                </div>
                                <div style={styles.metadataItem}>
                                    <span style={styles.metadataLabel}>Created By:</span>
                                    <span>{ticket.createdByName}</span>
                                </div>
                                {ticket.updatedAt && (
                                    <div style={styles.metadataItem}>
                                        <span style={styles.metadataLabel}>Updated:</span>
                                        <span>{new Date(ticket.updatedAt).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tabs for Comments and History */}
                    {ticket && (
                        <>
                            <div style={styles.tabContainer}>
                                <button
                                    onClick={() => setActiveTab('comments')}
                                    style={{
                                        ...styles.tab,
                                        ...(activeTab === 'comments' ? styles.activeTab : {})
                                    }}
                                >
                                    <MessageSquare size={16} />
                                    Comments ({comments.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    style={{
                                        ...styles.tab,
                                        ...(activeTab === 'history' ? styles.activeTab : {})
                                    }}
                                >
                                    <History size={16} />
                                    History ({actions.length})
                                </button>
                            </div>

                            {/* Comments Tab */}
                            {activeTab === 'comments' && (
                                <div style={styles.tabContent}>
                                    {canEdit && (
                                        <div style={styles.commentInputSection}>
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Add a comment..."
                                                style={{ ...styles.input, ...styles.textarea }}
                                                rows={3}
                                            />
                                            <button
                                                onClick={handleAddComment}
                                                style={{ ...styles.button, ...styles.addCommentButton }}
                                            >
                                                <Send size={16} />
                                                Add Comment
                                            </button>
                                        </div>
                                    )}

                                    <div style={styles.commentsContainer}>
                                        {comments.length === 0 ? (
                                            <p style={styles.emptyMessage}>No comments yet</p>
                                        ) : (
                                            comments.map((comment) => (
                                                <div key={comment.id} style={styles.commentItem}>
                                                    <div style={styles.commentHeader}>
                                                        <strong>{comment.createdByName}</strong>
                                                        <span style={styles.commentDate}>
                                                            {new Date(comment.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div style={styles.commentBody}>{comment.body}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* History Tab */}
                            {activeTab === 'history' && (
                                <div style={styles.tabContent}>
                                    <div style={styles.historyContainer}>
                                        {actions.length === 0 ? (
                                            <p style={styles.emptyMessage}>No history yet</p>
                                        ) : (
                                            actions.map((action) => (
                                                <div key={action.id} style={styles.historyItem}>
                                                    <div style={styles.historyDot} />
                                                    <div style={styles.historyContent}>
                                                        <div style={styles.historyHeader}>
                                                            <span style={styles.historyAction}>
                                                                {action.actionType}
                                                            </span>
                                                            {action.fromStatus && action.toStatus && (
                                                                <span style={styles.historyStatus}>
                                                                    {action.fromStatus} → {action.toStatus}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={styles.historyMeta}>
                                                            <span>{action.performedByName}</span>
                                                            <span style={styles.historyDate}>
                                                                {new Date(action.performedAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        {action.notes && (
                                                            <div style={styles.historyNotes}>{action.notes}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper functions
const getStatusColor = (status) => {
    const colors = {
        OPEN: '#e3f2fd',
        CONFIRMED: '#fff3e0',
        PAUSED: '#f3e5f5',
        CLOSED: '#e8f5e9',
        CANCELLED: '#ffebee',
        REOPENED: '#fce4ec',
    };
    return colors[status] || '#f5f5f5';
};

const getStatusTextColor = (status) => {
    const colors = {
        OPEN: '#1976d2',
        CONFIRMED: '#f57c00',
        PAUSED: '#7b1fa2',
        CLOSED: '#388e3c',
        CANCELLED: '#d32f2f',
        REOPENED: '#c2185b',
    };
    return colors[status] || '#666';
};

const styles = {
    container: {
        padding: '1.5rem',
        maxWidth: '1800px',
        margin: '0 auto',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: 0,
    },
    externalCode: {
        padding: '0.3rem 0.8rem',
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        borderRadius: '4px',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    headerRight: {
        display: 'flex',
        gap: '0.5rem',
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
        transition: 'all 0.2s',
    },
    saveButton: {
        backgroundColor: '#4caf50',
        color: 'white',
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
    content: {
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '1.5rem',
    },
    leftPanel: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    rightPanel: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    formSection: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    sectionTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#333',
    },
    sectionSubtitle: {
        fontSize: '0.85rem',
        color: '#666',
        marginBottom: '1rem',
        fontStyle: 'italic',
    },
    formRow: {
        marginBottom: '1rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.4rem',
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#555',
    },
    required: {
        color: '#d32f2f',
        marginLeft: '0.2rem',
    },
    input: {
        width: '100%',
        padding: '0.6rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.9rem',
        boxSizing: 'border-box',
    },
    textarea: {
        resize: 'vertical',
        fontFamily: 'inherit',
    },
    select: {
        width: '100%',
        padding: '0.6rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.9rem',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    checkboxGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
    },
    checkbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
    },
    checkboxText: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    hierarchyContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    hierarchyRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },
    hierarchyItem: {
        display: 'flex',
        flexDirection: 'column',
    },
    inlineGroup: {
        display: 'flex',
        gap: '1rem',
    },
    statusPanel: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    panelTitle: {
        fontSize: '1rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: '#333',
    },
    statusBadgeContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '1rem',
    },
    statusBadgeLarge: {
        padding: '0.6rem 1.5rem',
        borderRadius: '20px',
        fontSize: '1rem',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    statusActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginTop: '1rem',
    },
    statusButton: {
        padding: '0.7rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'all 0.2s',
    },
    confirmButton: {
        backgroundColor: '#fff3e0',
        color: '#f57c00',
    },
    pauseButton: {
        backgroundColor: '#f3e5f5',
        color: '#7b1fa2',
    },
    closeStatusButton: {
        backgroundColor: '#e8f5e9',
        color: '#388e3c',
    },
    reopenButton: {
        backgroundColor: '#fce4ec',
        color: '#c2185b',
    },
    metadata: {
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #eee',
    },
    metadataItem: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
        fontSize: '0.85rem',
    },
    metadataLabel: {
        fontWeight: '600',
        color: '#666',
    },
    tabContainer: {
        display: 'flex',
        backgroundColor: 'white',
        borderRadius: '8px 8px 0 0',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    tab: {
        flex: 1,
        padding: '0.8rem',
        border: 'none',
        backgroundColor: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#666',
        transition: 'all 0.2s',
    },
    activeTab: {
        backgroundColor: '#667eea',
        color: 'white',
    },
    tabContent: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0 0 8px 8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxHeight: '600px',
        overflowY: 'auto',
    },
    commentInputSection: {
        marginBottom: '1rem',
    },
    addCommentButton: {
        backgroundColor: '#667eea',
        color: 'white',
        marginTop: '0.5rem',
    },
    commentsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    commentItem: {
        padding: '1rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px',
        borderLeft: '3px solid #667eea',
    },
    commentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
    },
    commentDate: {
        fontSize: '0.8rem',
        color: '#999',
    },
    commentBody: {
        fontSize: '0.9rem',
        color: '#333',
        lineHeight: '1.5',
    },
    historyContainer: {
        position: 'relative',
        paddingLeft: '2rem',
    },
    historyItem: {
        position: 'relative',
        marginBottom: '1.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #eee',
    },
    historyDot: {
        position: 'absolute',
        left: '-2rem',
        top: '0.3rem',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: '#667eea',
        border: '3px solid white',
        boxShadow: '0 0 0 2px #667eea',
    },
    historyContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
    },
    historyHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    historyAction: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#333',
    },
    historyStatus: {
        fontSize: '0.85rem',
        padding: '0.2rem 0.6rem',
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        borderRadius: '4px',
    },
    historyMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        color: '#666',
    },
    historyDate: {
        color: '#999',
    },
    historyNotes: {
        fontSize: '0.85rem',
        color: '#666',
        marginTop: '0.3rem',
        fontStyle: 'italic',
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#999',
        padding: '2rem',
    },
    loading: {
        textAlign: 'center',
        padding: '3rem',
        fontSize: '1.2rem',
        color: '#666',
    },
};