import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle, Eye, MessageSquare, ArrowLeft } from 'lucide-react';
import { progressRequestsAPI } from '../../services/api';
import { showConfirmToast } from './ConfirmToast';
import { toast } from 'react-toastify';

export default function ProgressRequestsTable({ onNavigate }) {
    const [progressRequests, setProgressRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, assignedToMe, myRequests, pending
    const [stats, setStats] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [responseText, setResponseText] = useState('');

    useEffect(() => {
        loadProgressRequests();
        loadStats();
    }, [filter]);

    const loadProgressRequests = async () => {
        setLoading(true);
        try {
            const params = {};
            
            if (filter === 'assignedToMe') {
                params.assignedToMe = true;
            } else if (filter === 'myRequests') {
                params.myRequests = true;
            } else if (filter === 'pending') {
                params.status = 'Pending';
            }

            const response = await progressRequestsAPI.getAll(params);
            setProgressRequests(response.data);
        } catch (error) {
            console.error('Error loading progress requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await progressRequestsAPI.getStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleRespond = async () => {
        if (!selectedRequest || !responseText.trim()) return;

        try {
            await progressRequestsAPI.respond(selectedRequest.id, { responseText });
            toast.info('Bilgi raporu gönderildi');
            setSelectedRequest(null);
            setResponseText('');
            loadProgressRequests();
            loadStats();
        } catch (error) {
            console.error('Error responding:', error);
            toast.error('Bilgi raporu gönderilemedi');
        }
    };

    const handleCancel = async (requestId) => {
        const confirm = await showConfirmToast(`Bu talebi iptal etmek istediğinize emin misiniz?`);
        if (!confirm) { toast.info("İşlem iptal edildi."); return; }
        
        try {
            await progressRequestsAPI.cancel(requestId);
            toast.info('Talep iptal edildi');
            loadProgressRequests();
            loadStats();
        } catch (error) {
            console.error('Error canceling:', error);
            toast.error('Talep iptal edilemedi');
        }
    };

    const getStatusIcon = (status, isOverdue) => {
        if (isOverdue) return <AlertCircle size={20} color="#d32f2f" />;
        
        switch (status) {
            case 'Pending':
                return <Clock size={20} color="#f57c00" />;
            case 'Responded':
                return <CheckCircle size={20} color="#388e3c" />;
            case 'Cancelled':
                return <XCircle size={20} color="#666" />;
            default:
                return <Clock size={20} color="#999" />;
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'Pending': 'Bekliyor',
            'Responded': 'Yanıtlandı',
            'Cancelled': 'İptal Edildi',
            'Overdue': 'Süresi Geçti'
        };
        return labels[status] || status;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR', { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (selectedRequest) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <button onClick={() => setSelectedRequest(null)} style={styles.backBtn}>
                        <ArrowLeft size={20} />
                        Geri
                    </button>
                    <h1 style={styles.title}>Bilgi Talebi Yanıtla</h1>
                </div>

                <div style={styles.detailCard}>
                    <div style={styles.detailRow}>
                        <strong>Sorun:</strong>
                        <span>#{selectedRequest.ticketCode} - {selectedRequest.ticketTitle}</span>
                    </div>
                    <div style={styles.detailRow}>
                        <strong>Talep Eden:</strong>
                        <span>{selectedRequest.requestedByName}</span>
                    </div>
                    <div style={styles.detailRow}>
                        <strong>Talep Tarihi:</strong>
                        <span>{formatDate(selectedRequest.requestedAt)}</span>
                    </div>
                    {selectedRequest.requestMessage && (
                        <div style={styles.detailRow}>
                            <strong>Mesaj:</strong>
                            <span>{selectedRequest.requestMessage}</span>
                        </div>
                    )}
                </div>

                <div style={styles.responseSection}>
                    <label style={styles.label}>Bilgi Raporu</label>
                    <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Lütfen sorunla ilgili bilgi durumunu açıklayın..."
                        style={styles.textarea}
                        rows={8}
                    />
                    <button
                        onClick={handleRespond}
                        disabled={!responseText.trim()}
                        style={{
                            ...styles.submitBtn,
                            ...(responseText.trim() ? {} : styles.submitBtnDisabled)
                        }}
                    >
                        <MessageSquare size={16} />
                        Bilgi Raporunu Gönder
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Bilgi Talepleri</h1>
            </div>

            {stats && (
                <div style={styles.stats}>
                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Bana Atanan</div>
                        <div style={styles.statValue}>{stats.assignedToMeTotal}</div>
                        <div style={styles.statSubtext}>
                            {stats.assignedToMePending} bekliyor
                            {stats.assignedToMeOverdue > 0 && ` · ${stats.assignedToMeOverdue} gecikmiş`}
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Benim Taleplerim</div>
                        <div style={styles.statValue}>{stats.myRequestsTotal}</div>
                        <div style={styles.statSubtext}>
                            {stats.myRequestsPending} bekliyor · {stats.myRequestsResponded} yanıtlandı
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.filters}>
                <button
                    onClick={() => setFilter('all')}
                    style={{
                        ...styles.filterBtn,
                        ...(filter === 'all' ? styles.filterBtnActive : {})
                    }}
                >
                    Tümü
                </button>
                <button
                    onClick={() => setFilter('assignedToMe')}
                    style={{
                        ...styles.filterBtn,
                        ...(filter === 'assignedToMe' ? styles.filterBtnActive : {})
                    }}
                >
                    Bana Atananlar
                </button>
                <button
                    onClick={() => setFilter('myRequests')}
                    style={{
                        ...styles.filterBtn,
                        ...(filter === 'myRequests' ? styles.filterBtnActive : {})
                    }}
                >
                    Benim Taleplerim
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    style={{
                        ...styles.filterBtn,
                        ...(filter === 'pending' ? styles.filterBtnActive : {})
                    }}
                >
                    Bekleyenler
                </button>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Durum</th>
                            <th style={styles.th}>Sorun</th>
                            <th style={styles.th}>Talep Eden</th>
                            <th style={styles.th}>Hedef</th>
                            <th style={styles.th}>Talep Tarihi</th>
                            <th style={styles.th}>Son Tarih</th>
                            <th style={styles.th}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" style={styles.loading}>Yükleniyor...</td>
                            </tr>
                        ) : progressRequests.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={styles.empty}>Talep bulunamadı</td>
                            </tr>
                        ) : (
                            progressRequests.map((request) => (
                                <tr key={request.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={styles.statusCell}>
                                            {getStatusIcon(request.status, request.isOverdue)}
                                            <span>{getStatusLabel(request.status)}</span>
                                            {request.isOverdue && <span style={styles.overdueLabel}>GECİKMİŞ</span>}
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.ticketCell}>
                                            <strong>{request.ticketCode}</strong>
                                            <div style={styles.ticketTitle}>{request.ticketTitle}</div>
                                        </div>
                                    </td>
                                    <td style={styles.td}>{request.requestedByName}</td>
                                    <td style={styles.td}>{request.targetUserName}</td>
                                    <td style={styles.td}>{formatDate(request.requestedAt)}</td>
                                    <td style={styles.td}>
                                        {request.estimatedCompletion ? (
                                            <span style={request.isOverdue ? styles.overdueDue : {}}>
                                                {formatDate(request.estimatedCompletion)}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            <button
                                                onClick={() => onNavigate('ticket-detail', { ticketId: request.ticketId })}
                                                style={styles.actionBtn}
                                                title="Sorunu Görüntüle"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {request.status === 'Pending' && request.targetUserId === parseInt(localStorage.getItem('userId')) && (
                                                <button
                                                    onClick={() => setSelectedRequest(request)}
                                                    style={{ ...styles.actionBtn, ...styles.respondBtn }}
                                                    title="Yanıtla"
                                                >
                                                    <MessageSquare size={16} />
                                                </button>
                                            )}
                                            {request.status === 'Pending' && request.requestedByUserId === parseInt(localStorage.getItem('userId')) && (
                                                <button
                                                    onClick={() => handleCancel(request.id)}
                                                    style={{ ...styles.actionBtn, ...styles.cancelBtn }}
                                                    title="İptal Et"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
    },
    backBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        background: '#f5f5f5',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.95rem',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#333',
        margin: 0,
    },
    stats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
    },
    statCard: {
        padding: '1.5rem',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    statLabel: {
        fontSize: '0.875rem',
        color: '#666',
        marginBottom: '0.5rem',
    },
    statValue: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#667eea',
        marginBottom: '0.5rem',
    },
    statSubtext: {
        fontSize: '0.8rem',
        color: '#999',
    },
    filters: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
    },
    filterBtn: {
        padding: '0.75rem 1.5rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        background: 'white',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '500',
        color: '#666',
        transition: 'all 0.2s',
    },
    filterBtnActive: {
        backgroundColor: '#667eea',
        color: 'white',
        borderColor: '#667eea',
    },
    tableContainer: {
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '1rem',
        textAlign: 'left',
        background: '#f8f9fa',
        fontWeight: '600',
        color: '#333',
        borderBottom: '2px solid #eee',
    },
    tr: {
        borderBottom: '1px solid #eee',
        transition: 'background-color 0.2s',
    },
    td: {
        padding: '1rem',
        color: '#666',
    },
    statusCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    overdueLabel: {
        padding: '0.25rem 0.5rem',
        background: '#ffebee',
        color: '#d32f2f',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        borderRadius: '4px',
    },
    ticketCell: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    ticketTitle: {
        fontSize: '0.85rem',
        color: '#999',
    },
    overdueDue: {
        color: '#d32f2f',
        fontWeight: 'bold',
    },
    actions: {
        display: 'flex',
        gap: '0.5rem',
    },
    actionBtn: {
        padding: '0.5rem',
        border: 'none',
        borderRadius: '4px',
        background: '#e3f2fd',
        color: '#1976d2',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
    },
    respondBtn: {
        background: '#e8f5e9',
        color: '#388e3c',
    },
    cancelBtn: {
        background: '#ffebee',
        color: '#d32f2f',
    },
    loading: {
        padding: '3rem',
        textAlign: 'center',
        color: '#999',
    },
    empty: {
        padding: '3rem',
        textAlign: 'center',
        color: '#999',
    },
    detailCard: {
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
    },
    detailRow: {
        display: 'flex',
        gap: '1rem',
        padding: '0.75rem 0',
        borderBottom: '1px solid #eee',
    },
    responseSection: {
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '600',
        color: '#333',
    },
    textarea: {
        width: '100%',
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '1rem',
        fontFamily: 'inherit',
        resize: 'vertical',
        marginBottom: '1rem',
    },
    submitBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
    },
    submitBtnDisabled: {
        background: '#ccc',
        cursor: 'not-allowed',
    },
};