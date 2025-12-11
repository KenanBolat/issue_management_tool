import { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { progressRequestsAPI, notificationsAPI } from '../../services/api';
import { showConfirmToast } from './ConfirmToast';
import { toast } from 'react-toastify';

export default function ProgressRequestButton({ ticketId, ticketExternalCode, ticketCreatedByUserId, onNavigate }) {
    const [progressRequests, setProgressRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    debugger;

    useEffect(() => {
        if (ticketId) {
            loadProgressRequests();
        }
    }, [ticketId]);

    const loadProgressRequests = async () => {
        try {
            setLoading(true);
            const response = await progressRequestsAPI.getByTicket(ticketId);
            debugger;
            setProgressRequests(response.data || []);
        } catch (error) {
            console.error('Error loading progress requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestProgress = async () => {
        const confirm = await showConfirmToast("Bilgi raporu talep etmek istediğinize emin misiniz?");
        if (!confirm) {
            toast.info("İşlem iptal edildi.");
            return;
        }

        try {
            await notificationsAPI.createProgressRequest({
                ticketId: ticketId,
                targetUserId: ticketCreatedByUserId,
                message: `${ticketExternalCode} numaralı sorun için bilgi raporu bekleniyor`
            });

            toast.success('Bilgi talebi gönderildi');
            loadProgressRequests(); // Reload to show new request
        } catch (error) {
            console.error('Error requesting progress:', error);
            toast.error('Bilgi talebi gönderilemedi');
        }
    };

    const handleNavigateToRequests = () => {
        onNavigate('progress-management');
    };

    // Get pending (non-finalized) requests
    const pendingRequests = progressRequests.filter(pr => 
        pr.status !== 'Responded' && pr.status !== 'Cancelled'
    );

    // Get finalized requests
    const finalizedRequests = progressRequests.filter(pr => 
        pr.status === 'Responded' || pr.status === 'Cancelled'
    );

    const hasPendingRequest = pendingRequests.length > 0;
    const hasHistory = finalizedRequests.length > 0;

    const formatDate = (dateString) => {
        if (!dateString) return 'Tarih yok';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Pending': { label: 'Bekliyor', color: '#ff9800', icon: <Clock size={14} /> },
            'InProgress': { label: 'İşlemde', color: '#2196f3', icon: <AlertCircle size={14} /> },
            'Responded': { label: 'Yanıtlandı', color: '#4caf50', icon: <CheckCircle size={14} /> },
            'Cancelled': { label: 'İptal', color: '#f44336', icon: <AlertCircle size={14} /> }
        };

        const config = statusConfig[status] || { label: status, color: '#999', icon: null };

        return (
            <span style={{
                ...styles.statusBadge,
                backgroundColor: config.color,
            }}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <h3 style={styles.title}>Bilgi Talebi</h3>
                <div style={styles.loading}>Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Bilgi Talebi</h3>

            {/* STATE 1: Pending Request Exists - Show "Waiting" Button */}
            {hasPendingRequest && (
                <div style={styles.pendingSection}>
                    <button
                        onClick={handleNavigateToRequests}
                        style={styles.waitingButton}
                    >
                        <Clock size={16} style={{ animation: 'spin 2s linear infinite' }} />
                        Bilgi Bekleniyor...
                    </button>

                    <div style={styles.pendingInfo}>
                        {pendingRequests.map((request, index) => (
                            <div key={request.id} style={styles.pendingCard}>
                                <div style={styles.pendingHeader}>
                                    <span style={styles.pendingNumber}>#{index + 1}</span>
                                    {getStatusBadge(request.status)}
                                </div>
                                <div style={styles.pendingDetails}>
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>Talep Eden:</span>
                                        <span style={styles.detailValue}>{request.requestedByName}</span>
                                    </div>
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>Hedef:</span>
                                        <span style={styles.detailValue}>{request.targetUserName}</span>
                                    </div>
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>Tarih:</span>
                                        <span style={styles.detailValue}>{formatDate(request.requestedAt)}</span>
                                    </div>
                                    {request.progressInfo && (
                                        <div style={styles.progressInfo}>
                                            <span style={styles.detailLabel}>Son Durum:</span>
                                            <p style={styles.progressText}>{request.progressInfo}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.infoMessage}>
                        <AlertCircle size={16} />
                        <span>Bekleyen talep var. Detaylar için yukarıdaki butona tıklayın.</span>
                    </div>
                </div>
            )}

            {/* STATE 2 & 3: No Pending Request - Show History (if any) and New Request Button */}
            {!hasPendingRequest && (
                <>
                    {/* Show History if exists */}
                    {hasHistory && (
                        <div style={styles.historySection}>
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                style={styles.historyToggle}
                            >
                                <span>Geçmiş Talepler ({finalizedRequests.length})</span>
                                {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            {showHistory && (
                                <div style={styles.historyList}>
                                    {finalizedRequests.map((request, index) => (
                                        <div key={request.id} style={styles.historyItem}>
                                            <div style={styles.historyHeader}>
                                                <span style={styles.historyNumber}>
                                                    {index + 1}. Bilgi Talebi
                                                </span>
                                                {getStatusBadge(request.status)}
                                            </div>
                                            <div style={styles.historyDate}>
                                                <span>Tamamlanma: {formatDate(request.respondedAt || request.requestedAt)}</span>
                                            </div>
                                            {request.progressInfo && (
                                                <div style={styles.historyResponse}>
                                                    <span style={styles.detailLabel}>Yanıt:</span>
                                                    <p style={styles.historyResponseText}>{request.progressInfo}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* New Request Button */}
                    <button
                        onClick={handleRequestProgress}
                        style={styles.newRequestButton}
                    >
                        <Clock size={16} />
                        {hasHistory ? 'Yeni Bilgi Talebi Oluştur' : 'Bilgi Talep Et !'}
                    </button>
                </>
            )}
        </div>
    );
}

const styles = {
    container: {
        marginTop: '1.5rem',
    },
    title: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    loading: {
        padding: '1rem',
        textAlign: 'center',
        color: '#999',
        fontStyle: 'italic',
    },
    
    // Pending Request Styles
    pendingSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    waitingButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#ff9800',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(255, 152, 0, 0.3)',
    },
    pendingInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    pendingCard: {
        backgroundColor: '#fff3e0',
        border: '1px solid #ff9800',
        borderRadius: '6px',
        padding: '1rem',
    },
    pendingHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
    },
    pendingNumber: {
        fontWeight: '700',
        color: '#ff9800',
        fontSize: '1rem',
    },
    pendingDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    detailRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
    },
    detailLabel: {
        color: '#666',
        fontWeight: '500',
    },
    detailValue: {
        color: '#333',
        fontWeight: '600',
    },
    progressInfo: {
        marginTop: '0.5rem',
        paddingTop: '0.5rem',
        borderTop: '1px solid #ffd54f',
    },
    progressText: {
        margin: '0.25rem 0 0 0',
        fontSize: '0.85rem',
        color: '#555',
        fontStyle: 'italic',
    },
    infoMessage: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem',
        backgroundColor: '#fff9c4',
        border: '1px solid #fbc02d',
        borderRadius: '6px',
        fontSize: '0.85rem',
        color: '#f57c00',
    },

    // History Styles
    historySection: {
        marginBottom: '1rem',
    },
    historyToggle: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#666',
        transition: 'all 0.2s',
    },
    historyList: {
        marginTop: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    historyItem: {
        backgroundColor: '#f9f9f9',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        padding: '1rem',
    },
    historyHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
    },
    historyNumber: {
        fontWeight: '600',
        color: '#333',
        fontSize: '0.9rem',
    },
    historyDate: {
        fontSize: '0.8rem',
        color: '#666',
        marginBottom: '0.5rem',
    },
    historyResponse: {
        marginTop: '0.5rem',
        paddingTop: '0.5rem',
        borderTop: '1px solid #e0e0e0',
    },
    historyResponseText: {
        margin: '0.25rem 0 0 0',
        fontSize: '0.85rem',
        color: '#555',
        fontStyle: 'italic',
    },

    // New Request Button
    newRequestButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)',
    },

    // Status Badge
    statusBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: 'white',
    },
};