import { useState, useEffect, useMemo } from 'react';
import { Clock, ChevronDown, ChevronRight, Search, ArrowUpDown, ExternalLink, CheckCircle, Trash2, Filter, MessageSquare, TrendingUp } from 'lucide-react';
import { progressRequestsAPI } from '../../services/api';

export default function ProgressRequestManagement({ onViewTicket, onNavigate }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'totalDuration', direction: 'desc' });
    const [expandedTickets, setExpandedTickets] = useState(new Set());
    const [filter, setFilter] = useState('all');
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showRespondModal, setShowRespondModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [progressInfo, setProgressInfo] = useState('');
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [estimatedCompletion, setEstimatedCompletion] = useState('');
    const [responseNotes, setResponseNotes] = useState('');

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await progressRequestsAPI.getAll();
            setRequests(response.data);
        } catch (error) {
            console.error('Error loading progress requests:', error);
            alert('İlerleme talepleri yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const calculateDurationHours = (start, end) => {
        const startDate = new Date(start);
        const endDate = end ? new Date(end) : new Date();
        return Math.floor((endDate - startDate) / (1000 * 60 * 60));
    };

    // Group requests by ticket ID
    const groupedRequests = useMemo(() => {
        const groups = {};
        
        requests.forEach(req => {
            if (!groups[req.ticketId]) {
                groups[req.ticketId] = {
                    ticketId: req.ticketId,
                    ticketCode: req.ticketCode,
                    requests: [],
                    totalHours: 0,
                    pendingCount: 0,
                    respondedCount: 0,
                    hasPending: false,
                    latestProgress: null
                };
            }

            
            const hours = req.durationHours ?? calculateDurationHours(req.requestedAt, req.respondedAt);
            
            groups[req.ticketId].requests.push({
                ...req,
                durationHours: hours
            });
            groups[req.ticketId].totalHours += hours;
            
            if (!req.isResponded) {
                groups[req.ticketId].pendingCount++;
                groups[req.ticketId].hasPending = true;
            } else {
                groups[req.ticketId].respondedCount++;
            }

            // Track latest progress
            if (req.progressInfo && (!groups[req.ticketId].latestProgress || 
                new Date(req.requestedAt) > new Date(groups[req.ticketId].latestProgress.requestedAt))) {
                groups[req.ticketId].latestProgress = req;
            }
        });
        
        return Object.values(groups);
    }, [requests]);

    // Filter and sort similar to PauseManagement
    const filteredGroups = useMemo(() => {
        let filtered = groupedRequests;
        
        if (filter === 'pending') {
            filtered = filtered.filter(g => g.hasPending);
        } else if (filter === 'responded') {
            filtered = filtered.filter(g => !g.hasPending);
        }
        
        if (searchTerm) {
            filtered = filtered.filter(group => 
                group.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.requests.some(r => 
                    (r.requestMessage && r.requestMessage.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    r.requestedByUserName.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
        
        return filtered;
    }, [groupedRequests, searchTerm, filter]);

    const sortedGroups = useMemo(() => {
        const sorted = [...filteredGroups];
        
        sorted.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortConfig.key) {
                case 'ticketCode':
                    aValue = a.ticketCode;
                    bValue = b.ticketCode;
                    break;
                case 'totalDuration':
                    aValue = a.totalHours;
                    bValue = b.totalHours;
                    break;
                case 'requestCount':
                    aValue = a.requests.length;
                    bValue = b.requests.length;
                    break;
                case 'status':
                    aValue = a.hasPending ? 1 : 0;
                    bValue = b.hasPending ? 1 : 0;
                    break;
                default:
                    return 0;
            }
            
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        
        return sorted;
    }, [filteredGroups, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const toggleExpand = (ticketId) => {
        setExpandedTickets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(ticketId)) {
                newSet.delete(ticketId);
            } else {
                newSet.add(ticketId);
            }
            return newSet;
        });
    };

    const handleTicketClick = (ticketId) => {
        if (onViewTicket) {
            onViewTicket(ticketId);
        }
    };

    const handleUpdateProgress = async () => {
        if (!selectedRequest) return;
        if (!progressInfo.trim()) {
            alert('Lütfen ilerleme bilgisi giriniz');
            return;
        }

        try {
            await progressRequestsAPI.updateProgress(selectedRequest.id, {
                progressInfo,
                progressPercentage: progressPercentage || null,
                estimatedCompletion: estimatedCompletion || null
            // detectedDate: formData.detectedDate ? new Date(formData.detectedDate).toISOString() : null,

            });
            
            alert('İlerleme bilgisi güncellendi');
            setShowUpdateModal(false);
            resetUpdateForm();
            loadRequests();
        } catch (error) {
            console.error('Error updating progress:', error);
            alert('İlerleme güncellenirken hata oluştu');
        }
    };

    const handleRespond = async () => {
        if (!selectedRequest) return;
        if (!responseNotes.trim()) {
            alert('Lütfen yanıt notu giriniz');
            return;
        }

        try {
            await progressRequestsAPI.respond(selectedRequest.id, {
                responseNotes
            });
            
            alert('Talep yanıtlandı');
            setShowRespondModal(false);
            resetRespondForm();
            loadRequests();
        } catch (error) {
            console.error('Error responding to request:', error);
            alert('Yanıtlama sırasında hata oluştu');
        }
    };

    const handleDelete = async (requestId) => {
        if (!window.confirm('Bu ilerleme talebini silmek istediğinize emin misiniz?')) return;

        try {
            await progressRequestsAPI.delete(requestId);
            alert('Talep silindi');
            loadRequests();
        } catch (error) {
            console.error('Error deleting request:', error);
            alert('Silme işlemi başarısız');
        }
    };

    const resetUpdateForm = () => {
        setProgressInfo('');
        setProgressPercentage(0);
        setEstimatedCompletion('');
        setSelectedRequest(null);
    };

    const resetRespondForm = () => {
        setResponseNotes('');
        setSelectedRequest(null);
    };

    const formatDuration = (hours) => {
        if (hours === 0) return '0 saat';
        if (hours === 1) return '1 saat';
        if (hours < 24) return `${hours} saat`;
        
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        
        if (remainingHours === 0) {
            return `${hours} saat (${days} gün)`;
        }
        return `${hours} saat (${days} gün ${remainingHours} saat)`;
    };

    const formatTotalDuration = (hours) => {
        const days = (hours / 24).toFixed(1);
        return `${hours} saat (~${days} gün)`;
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
            {/* Header - Similar to PauseManagement */}
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <TrendingUp size={28} />
                    İlerleme Talepleri Yönetimi
                </h1>

                <div style={styles.stats}>
                    <div style={styles.statCard}>
                        <div style={styles.statValue}>{groupedRequests.length}</div>
                        <div style={styles.statLabel}>Toplam Ticket</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statValue}>{requests.filter(r => !r.isResponded).length}</div>
                        <div style={styles.statLabel}>Bekleyen Talepler</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statValue}>{requests.filter(r => r.progressInfo).length}</div>
                        <div style={styles.statLabel}>İlerleme Bildirilen</div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div style={styles.controls}>
                <div style={styles.searchContainer}>
                    <Search size={20} style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Ticket numarası, mesaj veya kullanıcı ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>

                <div style={styles.filterButtons}>
                    <button
                        onClick={() => setFilter('all')}
                        style={{
                            ...styles.filterButton,
                            ...(filter === 'all' ? styles.filterButtonActive : {})
                        }}
                    >
                        <Filter size={16} />
                        Tümü ({groupedRequests.length})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        style={{
                            ...styles.filterButton,
                            ...(filter === 'pending' ? styles.filterButtonActive : {})
                        }}
                    >
                        Bekleyen ({groupedRequests.filter(g => g.hasPending).length})
                    </button>
                    <button
                        onClick={() => setFilter('responded')}
                        style={{
                            ...styles.filterButton,
                            ...(filter === 'responded' ? styles.filterButtonActive : {})
                        }}
                    >
                        Yanıtlanan ({groupedRequests.filter(g => !g.hasPending).length})
                    </button>
                </div>
            </div>

            {/* Table - Similar structure to PauseManagement */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{...styles.th, width: '50px'}}></th>
                            <th 
                                style={{...styles.th, ...styles.sortable, width: '150px'}}
                                onClick={() => handleSort('ticketCode')}
                            >
                                <div style={styles.thContent}>
                                    Ticket No
                                    <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th 
                                style={{...styles.th, ...styles.sortable, width: '120px'}}
                                onClick={() => handleSort('requestCount')}
                            >
                                <div style={styles.thContent}>
                                    Talep Sayısı
                                    <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th style={{...styles.th, width: '180px'}}>Son İlerleme</th>
                            <th 
                                style={{...styles.th, ...styles.sortable, width: '150px'}}
                                onClick={() => handleSort('totalDuration')}
                            >
                                <div style={styles.thContent}>
                                    Toplam Süre
                                    <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th 
                                style={{...styles.th, ...styles.sortable, width: '120px'}}
                                onClick={() => handleSort('status')}
                            >
                                <div style={styles.thContent}>
                                    Durum
                                    <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th style={{...styles.th, width: '120px'}}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedGroups.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={styles.emptyCell}>
                                    {searchTerm 
                                        ? 'Arama kriterlerine uygun kayıt bulunamadı' 
                                        : 'İlerleme talebi bulunamadı'}
                                </td>
                            </tr>
                        ) : (
                            sortedGroups.map((group) => (
                                <>
                                    {/* Group Row */}
                                    <tr 
                                        key={`group-${group.ticketId}`}
                                        style={styles.groupRow}
                                    >
                                        <td style={styles.td}>
                                            <button
                                                onClick={() => toggleExpand(group.ticketId)}
                                                style={styles.expandButton}
                                            >
                                                {expandedTickets.has(group.ticketId) 
                                                    ? <ChevronDown size={20} />
                                                    : <ChevronRight size={20} />
                                                }
                                            </button>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.ticketCodeCell}>
                                                <span style={styles.ticketCode}>
                                                    {group.ticketCode}
                                                </span>
                                                <button
                                                    onClick={() => handleTicketClick(group.ticketId)}
                                                    style={styles.linkButton}
                                                    title="Ticket detayına git"
                                                >
                                                    <ExternalLink size={16} /> 
                                                </button>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.countBadge}>
                                                {group.requests.length} talep
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            {group.latestProgress ? (
                                                <div style={styles.progressBadge}>
                                                    %{group.latestProgress.progressPercentage || 0}
                                                </div>
                                            ) : (
                                                <span style={styles.noProgress}>Bildirilmedi</span>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <strong style={styles.totalDuration}>
                                                {formatTotalDuration(group.totalHours)}
                                            </strong>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.statusGroup}>
                                                {group.pendingCount > 0 && (
                                                    <span style={styles.statusBadgePending}>
                                                        {group.pendingCount} Bekleyen
                                                    </span>
                                                )}
                                                {group.respondedCount > 0 && (
                                                    <span style={styles.statusBadgeResponded}>
                                                        {group.respondedCount} Yanıtlandı
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                onClick={() => toggleExpand(group.ticketId)}
                                                style={styles.viewButton}
                                            >
                                                {expandedTickets.has(group.ticketId) ? 'Gizle' : 'Detaylar'}
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Expanded Detail Rows */}
                                    {expandedTickets.has(group.ticketId) && (
                                        <tr key={`expanded-${group.ticketId}`}>
                                            <td colSpan="7" style={styles.expandedCell}>
                                                <div style={styles.expandedContent}>
                                                    <table style={styles.detailTable}>
                                                        <thead>
                                                            <tr>
                                                                <th style={styles.detailTh}>#</th>
                                                                <th style={styles.detailTh}>Talep Eden</th>
                                                                <th style={styles.detailTh}>Hedef</th>
                                                                <th style={styles.detailTh}>Talep Tarihi</th>
                                                                <th style={styles.detailTh}>Süre</th>
                                                                <th style={styles.detailTh}>İlerleme</th>
                                                                <th style={styles.detailTh}>Tahmini Tamamlanma Tarihi</th>
                                                                
                                                                <th style={styles.detailTh}>Mesaj</th>
                                                                <th style={styles.detailTh}>Durum</th>
                                                                <th style={styles.detailTh}>İşlemler</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {group.requests.map((req, idx) => (
                                                                <tr key={req.id} style={styles.detailTr}>
                                                                    <td style={styles.detailTd}>
                                                                        <span style={styles.requestNumber}>
                                                                            #{idx + 1}
                                                                        </span>
                                                                    </td>
                                                                    <td style={styles.detailTd}>
                                                                        {req.requestedByName}
                                                                    </td>
                                                                    <td style={styles.detailTd}>
                                                                        {req.targetUserName}
                                                                    </td>
                                                                    <td style={styles.detailTd}>
                                                                        {formatDate(req.requestedAt)}
                                                                    </td>
                                                                    <td style={styles.detailTd}>
                                                                        {formatDuration(req.durationHours)}
                                                                    </td>
                                                                    <td style={styles.detailTd}>
                                                                        {req.progressPercentage !== null ? (
                                                                            <div style={styles.progressCell}>
                                                                                <div style={styles.progressBar}>
                                                                                    <div 
                                                                                        style={{
                                                                                            ...styles.progressFill,
                                                                                            width: `${req.progressPercentage}%`
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                                <span style={styles.progressText}>
                                                                                    %{req.progressPercentage}
                                                                                </span>
                                                                            </div>
                                                                        ) : (
                                                                            <span style={styles.noProgress}>-</span>
                                                                        )}
                                                                    </td>
                                                                    <td style={styles.detailTd}>
                                                                        <div style={styles.messageCell}>
                                                                            {req.estimatedCompletion }                                                                        </div>
                                                                    </td>
                                                                    <td style={styles.detailTd}>
                                                                        <div style={styles.messageCell}>
                                                                            {req.progressInfo }
                                                                        </div>
                                                                    </td>
                                                                    <td style={styles.detailTd}>
                                                                        {req.isResponded ? (
                                                                            <span style={styles.statusResponded}>
                                                                                <CheckCircle size={14} />
                                                                                Yanıtlandı
                                                                            </span>
                                                                        ) : (
                                                                            <span style={styles.statusPending}>
                                                                                <Clock size={14} />
                                                                                Bekliyor
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td style={styles.detailTd}>
                                                                        <div style={styles.actions}>
                                                                            {!req.isResponded && (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setSelectedRequest(req);
                                                                                            setProgressInfo(req.progressInfo || '');
                                                                                            setProgressPercentage(req.progressPercentage || 0);
                                                                                            setEstimatedCompletion(req.estimatedCompletion ? req.estimatedCompletion.slice(0,16) : '');
                                                                                            debugger;
                                                                                            setShowUpdateModal(true);
                                                                                        }}
                                                                                        style={styles.updateButton}
                                                                                        title="İlerleme Güncelle"
                                                                                    >
                                                                                        <TrendingUp size={16} />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setSelectedRequest(req);
                                                                                            setShowRespondModal(true);
                                                                                        }}
                                                                                        style={styles.respondButton}
                                                                                        title="Yanıtla"
                                                                                    >
                                                                                        <MessageSquare size={16} />
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                            <button
                                                                                onClick={() => handleDelete(req.id)}
                                                                                style={styles.deleteButton}
                                                                                title="Sil"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot>
                                                            <tr style={styles.subtotalRow}>
                                                                <td colSpan="4" style={styles.subtotalLabel}>
                                                                    <strong>Ara Toplam:</strong>
                                                                </td>
                                                                <td style={styles.subtotalValue}>
                                                                    <strong>{formatTotalDuration(group.totalHours)}</strong>
                                                                </td>
                                                                <td colSpan="4"></td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Update Progress Modal */}
            {showUpdateModal && (
                <>
                    <div style={styles.modalBackdrop} onClick={() => setShowUpdateModal(false)} />
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>İlerleme Güncelle</h2>
                        <p style={styles.modalSubtitle}>
                            Ticket: <strong>{selectedRequest?.ticketExternalCode}</strong>
                        </p>
                        
                        <div style={styles.modalField}>
                            <label style={styles.label}>
                                İlerleme Bilgisi <span style={styles.required}>*</span>
                            </label>
                            <textarea
                                value={progressInfo}
                                onChange={(e) => setProgressInfo(e.target.value)}
                                style={styles.textarea}
                                rows={4}
                                placeholder="Yapılan işlemleri ve mevcut durumu açıklayın..."
                            />
                        </div>

                        <div style={styles.modalField}>
                            <label style={styles.label}>Tamamlanma Yüzdesi</label>
                            <div style={styles.percentageContainer}>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={progressPercentage}
                                    onChange={(e) => setProgressPercentage(parseInt(e.target.value))}
                                    style={styles.rangeInput}
                                />
                                <span style={styles.percentageValue}>%{progressPercentage}</span>
                            </div>
                        </div>

                        <div style={styles.modalField}>
                            <label style={styles.label}>Tahmini Tamamlanma Tarihi</label>
                            <input
                                type="datetime-local"
                                value={estimatedCompletion}
                                onChange={(e) => setEstimatedCompletion(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.modalActions}>
                            <button
                                onClick={() => {
                                    setShowUpdateModal(false);
                                    resetUpdateForm();
                                }}
                                style={styles.cancelButton}
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleUpdateProgress}
                                style={styles.confirmButton}
                            >
                                <TrendingUp size={16} />
                                Güncelle
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Respond Modal */}
            {showRespondModal && (
                <>
                    <div style={styles.modalBackdrop} onClick={() => setShowRespondModal(false)} />
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Talebe Yanıt Ver</h2>
                        <p style={styles.modalSubtitle}>
                            Ticket: <strong>{selectedRequest?.ticketExternalCode}</strong>
                        </p>
                        
                        <div style={styles.modalField}>
                            <label style={styles.label}>
                                Yanıt Notu <span style={styles.required}>*</span>
                            </label>
                            <textarea
                                value={responseNotes}
                                onChange={(e) => setResponseNotes(e.target.value)}
                                style={styles.textarea}
                                rows={4}
                                placeholder="Talebi nasıl tamamladığınızı açıklayın..."
                            />
                        </div>

                        <div style={styles.modalActions}>
                            <button
                                onClick={() => {
                                    setShowRespondModal(false);
                                    resetRespondForm();
                                }}
                                style={styles.cancelButton}
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleRespond}
                                style={styles.confirmButton}
                            >
                                <CheckCircle size={16} />
                                Yanıtla
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Styles (similar to PauseManagement with additional progress-specific styles)
const styles = {
    // ... (copy all styles from PauseManagement and add these additional ones)
    
    progressBadge: {
        display: 'inline-block',
        padding: '0.4rem 0.8rem',
        borderRadius: '12px',
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        fontSize: '0.9rem',
        fontWeight: 'bold',
    },
    noProgress: {
        color: '#999',
        fontStyle: 'italic',
        fontSize: '0.85rem',
    },
    statusBadgePending: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        backgroundColor: '#fff3cd',
        color: '#856404',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    statusBadgeResponded: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        backgroundColor: '#d4edda',
        color: '#155724',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    progressCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    progressBar: {
        flex: 1,
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#667eea',
        transition: 'width 0.3s ease',
    },
    progressText: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#667eea',
        minWidth: '40px',
    },
    messageCell: {
        maxWidth: '250px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    statusPending: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.3rem 0.8rem',
        borderRadius: '12px',
        backgroundColor: '#fff3cd',
        color: '#856404',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    statusResponded: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.3rem 0.8rem',
        borderRadius: '12px',
        backgroundColor: '#d4edda',
        color: '#155724',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    updateButton: {
        padding: '0.5rem',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#2196f3',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.2s',
    },
    respondButton: {
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
    percentageContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    rangeInput: {
        flex: 1,
        height: '6px',
        borderRadius: '3px',
        outline: 'none',
        background: '#e0e0e0',
    },
    percentageValue: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#667eea',
        minWidth: '60px',
        textAlign: 'right',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.9rem',
    },
    
    container: {
        padding: '2rem',
        maxWidth: '1600px',
        margin: '0 auto',
    },
    header: {
        marginBottom: '2rem',
    },
    title: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: '#333',
        marginBottom: '1.5rem',
    },
    stats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
    },
    statCard: {
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center',
    },
    statValue: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#667eea',
        marginBottom: '0.5rem',
    },
    statLabel: {
        fontSize: '0.9rem',
        color: '#666',
    },
    controls: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    searchContainer: {
        position: 'relative',
        flex: '1 1 300px',
    },
    searchIcon: {
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#999',
    },
    searchInput: {
        width: '100%',
        padding: '0.75rem 1rem 0.75rem 3rem',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '0.95rem',
        transition: 'border-color 0.2s',
    },
    filterButtons: {
        display: 'flex',
        gap: '0.5rem',
    },
    filterButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        border: '2px solid #667eea',
        borderRadius: '8px',
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
    sortable: {
        cursor: 'pointer',
        userSelect: 'none',
    },
    thContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    groupRow: {
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
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
    expandButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        color: '#667eea',
    },
    ticketCodeCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    ticketCode: {
        fontFamily: 'monospace',
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#667eea',
    },
    linkButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0.25rem',
        color: '#667eea',
        display: 'flex',
        alignItems: 'center',
    },
    countBadge: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        fontSize: '0.85rem',
        fontWeight: '600',
    },
    totalDuration: {
        color: '#667eea',
        fontSize: '1rem',
    },
    statusGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    statusBadgeActive: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        backgroundColor: '#fff3cd',
        color: '#856404',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    statusBadgeCompleted: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        backgroundColor: '#d4edda',
        color: '#155724',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    viewButton: {
        padding: '0.5rem 1rem',
        border: '1px solid #667eea',
        borderRadius: '6px',
        background: 'white',
        color: '#667eea',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '500',
        transition: 'all 0.2s',
    },
    expandedCell: {
        padding: '0',
        backgroundColor: '#fafbfc',
    },
    expandedContent: {
        padding: '1.5rem',
    },
    detailTable: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    detailTh: {
        padding: '0.75rem',
        textAlign: 'left',
        backgroundColor: '#667eea',
        color: 'white',
        fontWeight: '600',
        fontSize: '0.85rem',
    },
    detailTr: {
        borderBottom: '1px solid #e0e0e0',
    },
    detailTd: {
        padding: '0.75rem',
        fontSize: '0.85rem',
        color: '#333',
    },
    pauseNumber: {
        fontWeight: 'bold',
        color: '#667eea',
    },
    ongoing: {
        color: '#f57c00',
        fontWeight: '600',
    },
    reasonCell: {
        maxWidth: '250px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    statusActive: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.3rem 0.8rem',
        borderRadius: '12px',
        backgroundColor: '#fff3cd',
        color: '#856404',
        fontSize: '0.8rem',
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
        fontSize: '0.8rem',
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
    subtotalRow: {
        backgroundColor: '#f8f9fa',
        borderTop: '2px solid #667eea',
    },
    subtotalLabel: {
        padding: '0.75rem',
        textAlign: 'right',
        fontSize: '0.9rem',
        color: '#333',
    },
    subtotalValue: {
        padding: '0.75rem',
        fontSize: '1rem',
        color: '#667eea',
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