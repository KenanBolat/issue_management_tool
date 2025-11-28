import { useState, useEffect } from 'react';
import { Clock, Edit2, Trash2, Play, Pause } from 'lucide-react';
import { ticketPausesAPI } from '../../services/api';

export default function PauseManagement() {
    const [pauses, setPauses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [selectedPause, setSelectedPause] = useState(null);
    const [resumeNotes, setResumeNotes] = useState('');
    const [filter, setFilter] = useState('active'); // 'all' or 'active'

    useEffect(() => {
        loadPauses();
    }, [filter]);

    const loadPauses = async () => {
        try {
            setLoading(true);
            const response = await ticketPausesAPI.getAll(filter === 'active');
            setPauses(response.data);
        } catch (error) {
            console.error('Error loading pauses:', error);
            alert('Duraklamalar yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleResume = async () => {
        if (!selectedPause) return;

        try {
            await ticketPausesAPI.resume(selectedPause.id, { resumeNotes });
            alert('Duraklama sonlandırıldı');
            setShowResumeModal(false);
            setResumeNotes('');
            setSelectedPause(null);
            loadPauses();
        } catch (error) {
            console.error('Error resuming pause:', error);
            alert('Duraklama sonlandırılırken hata oluştu');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu duraklama kaydını silmek istediğinize emin misiniz?')) return;

        try {
            await ticketPausesAPI.delete(id);
            alert('Duraklama kaydı silindi');
            loadPauses();
        } catch (error) {
            console.error('Error deleting pause:', error);
            alert('Silme işlemi başarısız');
        }
    };

    const formatDuration = (days) => {
        if (days === 0) return 'Bugün';
        if (days === 1) return '1 gün';
        return `${days} gün`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div style={styles.loading}>Yükleniyor...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <Clock size={28} />
                    Duraklama Yönetimi
                </h1>

                <div style={styles.filterButtons}>
                    <button
                        onClick={() => setFilter('active')}
                        style={{
                            ...styles.filterButton,
                            ...(filter === 'active' ? styles.filterButtonActive : {})
                        }}
                    >
                        Aktif Duraklamalar
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        style={{
                            ...styles.filterButton,
                            ...(filter === 'all' ? styles.filterButtonActive : {})
                        }}
                    >
                        Tüm Duraklamalar
                    </button>
                </div>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Ticket No</th>
                            <th style={styles.th}>Başlangıç</th>
                            <th style={styles.th}>Bitiş</th>
                            <th style={styles.th}>Süre</th>
                            <th style={styles.th}>Sebep</th>
                            <th style={styles.th}>Durduran</th>
                            <th style={styles.th}>Devam Ettiren</th>
                            <th style={styles.th}>Durum</th>
                            <th style={styles.th}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pauses.length === 0 ? (
                            <tr>
                                <td colSpan="9" style={styles.emptyCell}>
                                    {filter === 'active' 
                                        ? 'Aktif duraklama yok' 
                                        : 'Duraklama kaydı bulunamadı'}
                                </td>
                            </tr>
                        ) : (
                            pauses.map((pause) => (
                                <tr key={pause.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <span style={styles.ticketCode}>
                                            {pause.ticketExternalCode}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{formatDate(pause.pausedAt)}</td>
                                    <td style={styles.td}>
                                        {pause.resumedAt ? (
                                            formatDate(pause.resumedAt)
                                        ) : (
                                            <span style={styles.ongoing}>Devam Ediyor</span>
                                        )}
                                    </td>
                                    <td style={styles.td}>{formatDuration(pause.durationDays)}</td>
                                    <td style={styles.td}>
                                        <div style={styles.reasonCell}>{pause.pauseReason}</div>
                                    </td>
                                    <td style={styles.td}>{pause.pausedByUserName}</td>
                                    <td style={styles.td}>
                                        {pause.resumedByUserName || '-'}
                                    </td>
                                    <td style={styles.td}>
                                        {pause.isActive ? (
                                            <span style={styles.statusActive}>
                                                <Pause size={14} />
                                                Aktif
                                            </span>
                                        ) : (
                                            <span style={styles.statusCompleted}>
                                                <Play size={14} />
                                                Tamamlandı
                                            </span>
                                        )}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            {pause.isActive && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedPause(pause);
                                                        setShowResumeModal(true);
                                                    }}
                                                    style={styles.resumeButton}
                                                    title="Devam Ettir"
                                                >
                                                    <Play size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(pause.id)}
                                                style={styles.deleteButton}
                                                title="Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Resume Modal */}
            {showResumeModal && (
                <>
                    <div style={styles.modalBackdrop} onClick={() => setShowResumeModal(false)} />
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Duraklamayı Sonlandır</h2>
                        <p style={styles.modalSubtitle}>
                            Ticket: <strong>{selectedPause?.ticketExternalCode}</strong>
                        </p>
                        
                        <div style={styles.modalField}>
                            <label style={styles.label}>Devam Notu (Opsiyonel)</label>
                            <textarea
                                value={resumeNotes}
                                onChange={(e) => setResumeNotes(e.target.value)}
                                style={styles.textarea}
                                rows={4}
                                placeholder="Duraklamanın neden sonlandırıldığını açıklayın..."
                            />
                        </div>

                        <div style={styles.modalActions}>
                            <button
                                onClick={() => {
                                    setShowResumeModal(false);
                                    setResumeNotes('');
                                    setSelectedPause(null);
                                }}
                                style={styles.cancelButton}
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleResume}
                                style={styles.confirmButton}
                            >
                                <Play size={16} />
                                Devam Ettir
                            </button>
                        </div>
                    </div>
                </>
            )}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: '#333',
    },
    filterButtons: {
        display: 'flex',
        gap: '0.5rem',
    },
    filterButton: {
        padding: '0.6rem 1.2rem',
        border: '2px solid #667eea',
        borderRadius: '6px',
        background: 'white',
        color: '#667eea',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'all 0.2s',
    },
    filterButtonActive: {
        background: '#667eea',
        color: 'white',
    },
    loading: {
        textAlign: 'center',
        padding: '3rem',
        fontSize: '1.2rem',
        color: '#666',
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '1rem',
        textAlign: 'left',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
        fontWeight: '600',
        fontSize: '0.9rem',
        color: '#495057',
    },
    tr: {
        borderBottom: '1px solid #dee2e6',
        transition: 'background-color 0.2s',
    },
    td: {
        padding: '1rem',
        fontSize: '0.9rem',
        color: '#333',
    },
    emptyCell: {
        padding: '3rem',
        textAlign: 'center',
        color: '#999',
        fontStyle: 'italic',
    },
    ticketCode: {
        fontFamily: 'monospace',
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#667eea',
    },
    ongoing: {
        color: '#f57c00',
        fontWeight: '600',
        fontStyle: 'italic',
    },
    reasonCell: {
        maxWidth: '300px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    statusActive: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.3rem 0.8rem',
        borderRadius: '12px',
        backgroundColor: '#fff3cd',
        color: '#856404',
        fontSize: '0.85rem',
        fontWeight: '600',
    },
    statusCompleted: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.3rem 0.8rem',
        borderRadius: '12px',
        backgroundColor: '#d4edda',
        color: '#155724',
        fontSize: '0.85rem',
        fontWeight: '600',
    },
    actions: {
        display: 'flex',
        gap: '0.5rem',
    },
    resumeButton: {
        padding: '0.5rem',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#28a745',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.2s',
    },
    deleteButton: {
        padding: '0.5rem',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#dc3545',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.2s',
    },
    modalBackdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
    },
    modal: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        zIndex: 1001,
        minWidth: '500px',
    },
    modalTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        color: '#333',
    },
    modalSubtitle: {
        fontSize: '0.95rem',
        color: '#666',
        marginBottom: '1.5rem',
    },
    modalField: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#555',
    },
    textarea: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.9rem',
        fontFamily: 'inherit',
        resize: 'vertical',
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
    },
    cancelButton: {
        padding: '0.7rem 1.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        background: 'white',
        color: '#666',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    confirmButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.7rem 1.5rem',
        border: 'none',
        borderRadius: '4px',
        background: '#28a745',
        color: 'white',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
};