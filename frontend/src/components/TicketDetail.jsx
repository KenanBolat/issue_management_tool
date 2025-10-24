import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketAPI } from '../services/api';
import { ArrowLeft, Save, X } from 'lucide-react';

export default function TicketForm({ ticketId, mode = 'view' }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'OPEN',
        isBlocking: false,
        technicalReportRequired: false,
        externalCode: '',
    });

    const userRole = localStorage.getItem('role');
    const isReadOnly = mode === 'view' || userRole === 'Viewer';

    useEffect(() => {
        if (ticketId) {
            loadTicket();
        }
    }, [ticketId]);

    const loadTicket = async () => {
        try {
            setLoading(true);
            const response = await ticketAPI.getById(ticketId);
            const data = response.data;
            
            setTicket(data);
            setFormData({
                title: data.title,
                description: data.description,
                status: data.status,
                isBlocking: data.isBlocking,
                technicalReportRequired: data.technicalReportRequired,
                externalCode: data.externalCode,
            });
            setComments(data.comments || []);
        } catch (error) {
            console.error('Error loading ticket:', error);
            alert('Arıza kaydı yüklenemedi');
        } finally {
            setLoading(false);
        }
    };



    const handleSave = async () => {
        try {
            setLoading(true);
            if (ticketId) {
                await ticketAPI.update(ticketId, formData);
                alert('Arıza kaydı güncellendi');
            } else {
                await ticketAPI.create(formData);
                alert('Arıza kaydı oluşturuldu');
                navigate('/tickets');
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('Kayıt sırasında hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        
        try {
            await ticketAPI.addComment(ticketId, newComment);
            setNewComment('');
            loadTicket(); // Reload to get new comment
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Yorum eklenirken hata oluştu');
        }
    };

    if (loading && !ticket) {
        return <div style={styles.loading}>Yükleniyor...</div>;
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <button onClick={() => navigate('/tickets')} style={styles.backBtn}>
                    <ArrowLeft size={20} />
                    Geri
                </button>
                <h2 style={styles.headerTitle}>Arıza Kayıt Formu</h2>
                <div style={styles.headerButtons}>
                    {ticketId && (
                        <button style={styles.filterBtn}>
                            FİLTRE YOK
                        </button>
                    )}
                    <span style={styles.formId}>Form ID: {ticketId || '(New)'}</span>
                </div>
            </div>

            {/* Toolbar */}
            <div style={styles.toolbar}>
                <button style={styles.toolbarBtn}>
                    YENİ KAYIT
                </button>
                <button style={styles.toolbarBtn}>
                    KAYDI SİL
                </button>
                <button style={styles.toolbarBtn}>
                    FİLTRELE
                </button>
                <button style={styles.toolbarBtn}>
                    FİLTREYİ KALDIR
                </button>
                <button style={styles.toolbarBtn}>
                    BAŞ. FORM (TEK KAYIT)
                </button>
                <button style={styles.toolbarBtn}>
                    BAŞ. FORM (FİLTRE)
                </button>
            </div>

            {/* Main Form */}
            <div style={styles.formContainer}>
                {/* First Row */}
                <div style={styles.row}>
                    <div style={styles.field}>
                        <label style={styles.label}>Arıza No (Otomatik)</label>
                        <input
                            type="text"
                            value={ticketId || '0'}
                            disabled
                            style={{...styles.input, ...styles.inputDisabled}}
                        />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Tespit Edildiği Tarih / Saat</label>
                        <input
                            type="datetime-local"
                            disabled={isReadOnly}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Yükl. Bildirildiği Tarih / Saat</label>
                        <input
                            type="datetime-local"
                            disabled={isReadOnly}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Bildirim Şekli</label>
                        <select disabled={isReadOnly} style={styles.select}>
                            <option value=""></option>
                            <option>Email</option>
                            <option>Telefon</option>
                            <option>Sözlü</option>
                        </select>
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>TT No. (varsa)</label>
                        <input
                            type="text"
                            value={formData.externalCode}
                            onChange={(e) => setFormData({...formData, externalCode: e.target.value})}
                            disabled={isReadOnly}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Tespit Eden Personel</label>
                        <input
                            type="text"
                            disabled={isReadOnly}
                            style={styles.input}
                        />
                    </div>
                </div>

                {/* System Selection Row */}
                <div style={styles.sectionHeader}>
                    Forma Basılan Arıza No (Otomatik)
                </div>
                <div style={styles.systemSelection}>
                    <div style={styles.systemPath}>
                        <span style={styles.systemLabel}>ETKİLENEN SİSTEM / ALT SİSTEM / CI (FORMA BASILMAZ)</span>
                    </div>
                    <div style={styles.systemPath2}>
                        <span style={styles.pathText}>
                            Daima Sistem → Alt Sistem → CI → Komponent biçiminde seçiniz / değiştiriniz.
                        </span>
                    </div>
                    <div style={styles.systemRow}>
                        <div style={styles.systemField}>
                            <label>Sistem</label>
                            <select disabled={isReadOnly} style={styles.select}>
                                <option></option>
                            </select>
                        </div>
                        <div style={styles.systemField}>
                            <label>Alt Sistem</label>
                            <select disabled={isReadOnly} style={styles.select}>
                                <option></option>
                            </select>
                        </div>
                        <div style={styles.systemField}>
                            <label>Konfig. Birimi (CI)</label>
                            <select disabled={isReadOnly} style={styles.select}>
                                <option></option>
                            </select>
                        </div>
                        <div style={styles.systemField}>
                            <label>Komponent</label>
                            <select disabled={isReadOnly} style={styles.select}>
                                <option></option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Arıza Başlığı */}
                <div style={styles.sectionHeader}>
                    Arıza Başlığı (FORMA BASILMAZ)
                </div>
                <textarea
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    disabled={isReadOnly}
                    style={styles.textarea}
                    rows={2}
                />

                {/* Details Section */}
                <div style={styles.detailsRow}>
                    <div style={styles.detailField}>
                        <label>Operasyonel Akısı Etkiler?</label>
                        <select 
                            value={formData.isBlocking ? 'Evet' : 'Hayır'}
                            onChange={(e) => setFormData({...formData, isBlocking: e.target.value === 'Evet'})}
                            disabled={isReadOnly} 
                            style={styles.select}
                        >
                            <option>Hayır</option>
                            <option>Evet</option>
                        </select>
                    </div>
                    <div style={styles.detailField}>
                        <label>Tespit Edilen Arıza</label>
                        <textarea disabled={isReadOnly} style={styles.textarea} rows={4} />
                    </div>
                </div>

                <div style={styles.detailsRow}>
                    <div style={styles.detailField}>
                        <label>Parça No</label>
                        <input type="text" disabled={isReadOnly} style={styles.input} />
                    </div>
                    <div style={styles.detailField}>
                        <label>Seri No</label>
                        <input type="text" disabled={isReadOnly} style={styles.input} />
                    </div>
                    <div style={styles.detailField}>
                        <label>Parça Tanımı</label>
                        <input type="text" disabled={isReadOnly} style={styles.input} />
                    </div>
                </div>

                {/* Personnel Section */}
                <div style={styles.personnelRow}>
                    <div style={styles.personnelField}>
                        <label>Arızaya Müdahale Eden Personel</label>
                        <input type="text" disabled={isReadOnly} style={styles.input} />
                    </div>
                    <div style={styles.personnelField}>
                        <label>Arızaya Müdahale Tarihi / Saati</label>
                        <input type="datetime-local" disabled={isReadOnly} style={styles.input} />
                    </div>
                    <div style={styles.personnelField}>
                        <label>Arızanın Giderildiği Tarih / Saat</label>
                        <input type="datetime-local" disabled={isReadOnly} style={styles.input} />
                    </div>
                    <div style={styles.personnelField}>
                        <label>Arızayı Gideren Personel</label>
                        <input type="text" disabled={isReadOnly} style={styles.input} />
                    </div>
                </div>

                {/* Arızaya İlişkin Yapılan İşlem */}
                <div style={styles.sectionHeader}>
                    Arızaya İlişkin Yapılan İşlem
                </div>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    disabled={isReadOnly}
                    style={styles.textarea}
                    rows={4}
                />

                {/* Comments Section - NEW */}
                {ticketId && (
                    <div style={styles.commentsSection}>
                        <div style={styles.commentsSectionHeader}>
                            <h3 style={styles.commentsTitle}>Yorumlar</h3>
                            <span style={styles.commentsCount}>({comments.length} yorum)</span>
                        </div>
                        
                        {/* Add Comment */}
                        {!isReadOnly && (
                            <div style={styles.addCommentBox}>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Yorum ekleyin..."
                                    style={styles.commentInput}
                                    rows={3}
                                />
                                <button 
                                    onClick={handleAddComment}
                                    style={styles.addCommentBtn}
                                    disabled={!newComment.trim()}
                                >
                                    Yorum Ekle
                                </button>
                            </div>
                        )}

                        {/* Comments List */}
                        <div style={styles.commentsList}>
                            {comments.length === 0 ? (
                                <p style={styles.noComments}>Henüz yorum yok</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} style={styles.commentItem}>
                                        <div style={styles.commentHeader}>
                                            <div style={styles.commentAuthor}>
                                                <div style={styles.commentAvatar}>
                                                    {comment.createdByName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={styles.commentName}>{comment.createdByName}</div>
                                                    <div style={styles.commentTime}>
                                                        {new Date(comment.createdAt).toLocaleString('tr-TR')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={styles.commentBody}>{comment.body}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Activity Control */}
                <div style={styles.activitySection}>
                    <div style={styles.activityHeader}>FAALİYET KONTROLÜ</div>
                    <div style={styles.activityRow}>
                        <div style={styles.activityField}>
                            <label>PERSONEL Rütbe & Adı Soyadı</label>
                            <input type="text" disabled={isReadOnly} style={styles.input} />
                        </div>
                        <div style={styles.activityField}>
                            <label>BLK. KOM. Rütbe & Adı Soyadı</label>
                            <input type="text" disabled={isReadOnly} style={styles.input} />
                        </div>
                        <div style={styles.activityField}>
                            <label>Tarih / Saat</label>
                            <input type="datetime-local" disabled={isReadOnly} style={styles.input} />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={styles.actionButtons}>
                    <button 
                        onClick={handleSave}
                        disabled={isReadOnly || loading}
                        style={styles.saveBtn}
                    >
                        <Save size={16} />
                        {loading ? 'Kaydediliyor...' : 'KAYDET'}
                    </button>
                    <button 
                        onClick={() => navigate('/tickets')}
                        style={styles.cancelBtn}
                    >
                        <X size={16} />
                        KAPAT
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
                <div style={styles.footerNav}>
                    <button style={styles.navBtn}>◄◄</button>
                    <button style={styles.navBtn}>◄</button>
                    <button style={styles.navBtn}>►</button>
                    <button style={styles.navBtn}>►►</button>
                    <span style={styles.recordCount}>138 (Yeni) / 138</span>
                </div>
                <div style={styles.footerButtons}>
                    <button style={styles.footerBtn}>KAYDET</button>
                    <button style={styles.footerBtnRed}>KAPAT</button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: '#f0f0f0',
        minHeight: '100vh',
        fontFamily: 'Tahoma, Arial, sans-serif',
        fontSize: '11px',
    },
    loading: {
        textAlign: 'center',
        padding: '3rem',
        fontSize: '1.2rem',
    },
    header: {
        backgroundColor: '#c85d5d',
        color: 'white',
        padding: '8px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backBtn: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        color: 'white',
        padding: '6px 12px',
        cursor: 'pointer',
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
    },
    headerTitle: {
        margin: 0,
        fontSize: '14px',
        fontWeight: 'bold',
    },
    headerButtons: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
    filterBtn: {
        backgroundColor: '#5cb85c',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 'bold',
    },
    formId: {
        fontSize: '12px',
    },
    toolbar: {
        backgroundColor: '#e0e0e0',
        padding: '6px',
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid #ccc',
    },
    toolbarBtn: {
        backgroundColor: 'white',
        border: '1px solid #aaa',
        padding: '4px 8px',
        fontSize: '10px',
        cursor: 'pointer',
        borderRadius: '2px',
    },
    formContainer: {
        backgroundColor: 'white',
        margin: '10px',
        padding: '15px',
        border: '1px solid #ccc',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '10px',
        marginBottom: '15px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        fontSize: '10px',
        fontWeight: 'bold',
        marginBottom: '3px',
        color: '#333',
    },
    input: {
        padding: '4px 6px',
        border: '1px solid #aaa',
        fontSize: '11px',
        borderRadius: '2px',
    },
    inputDisabled: {
        backgroundColor: '#f5f5f5',
    },
    select: {
        padding: '4px 6px',
        border: '1px solid #aaa',
        fontSize: '11px',
        borderRadius: '2px',
    },
    sectionHeader: {
        backgroundColor: '#e8e8e8',
        padding: '6px 10px',
        fontWeight: 'bold',
        fontSize: '11px',
        marginBottom: '10px',
        border: '1px solid #ccc',
    },
    systemSelection: {
        marginBottom: '15px',
    },
    systemPath: {
        backgroundColor: '#f9f9f9',
        padding: '8px',
        border: '1px solid #ddd',
        marginBottom: '5px',
    },
    systemLabel: {
        fontSize: '10px',
        fontWeight: 'bold',
        color: '#666',
    },
    systemPath2: {
        backgroundColor: '#fff4f4',
        padding: '8px',
        border: '1px solid #ddd',
        marginBottom: '10px',
    },
    pathText: {
        fontSize: '10px',
        color: '#d9534f',
        fontWeight: 'bold',
    },
    systemRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
    },
    systemField: {
        display: 'flex',
        flexDirection: 'column',
    },
    textarea: {
        padding: '6px',
        border: '1px solid #aaa',
        fontSize: '11px',
        borderRadius: '2px',
        resize: 'vertical',
        marginBottom: '15px',
        fontFamily: 'Tahoma, Arial, sans-serif',
    },
    detailsRow: {
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: '10px',
        marginBottom: '15px',
    },
    detailField: {
        display: 'flex',
        flexDirection: 'column',
    },
    personnelRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        marginBottom: '15px',
    },
    personnelField: {
        display: 'flex',
        flexDirection: 'column',
    },
    // Comments Section Styles
    commentsSection: {
        marginTop: '25px',
        marginBottom: '20px',
        border: '2px solid #d9534f',
        borderRadius: '4px',
        padding: '15px',
        backgroundColor: '#fafafa',
    },
    commentsSectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '2px solid #d9534f',
    },
    commentsTitle: {
        margin: 0,
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#d9534f',
    },
    commentsCount: {
        fontSize: '11px',
        color: '#666',
    },
    addCommentBox: {
        marginBottom: '20px',
    },
    commentInput: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '3px',
        fontSize: '11px',
        marginBottom: '8px',
        fontFamily: 'Tahoma, Arial, sans-serif',
    },
    addCommentBtn: {
        backgroundColor: '#5cb85c',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 'bold',
    },
    commentsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    noComments: {
        textAlign: 'center',
        color: '#999',
        padding: '20px',
        fontSize: '11px',
    },
    commentItem: {
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '12px',
    },
    commentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
    },
    commentAuthor: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    commentAvatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#c85d5d',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '13px',
    },
    commentName: {
        fontWeight: 'bold',
        fontSize: '11px',
        color: '#333',
    },
    commentTime: {
        fontSize: '10px',
        color: '#999',
    },
    commentBody: {
        fontSize: '11px',
        color: '#555',
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap',
    },
    activitySection: {
        marginBottom: '20px',
    },
    activityHeader: {
        backgroundColor: '#e8e8e8',
        padding: '6px 10px',
        fontWeight: 'bold',
        fontSize: '11px',
        marginBottom: '10px',
        border: '1px solid #ccc',
    },
    activityRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 300px',
        gap: '10px',
    },
    activityField: {
        display: 'flex',
        flexDirection: 'column',
    },
    actionButtons: {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        marginTop: '20px',
        paddingTop: '15px',
        borderTop: '1px solid #ddd',
    },
    saveBtn: {
        backgroundColor: '#5cb85c',
        color: 'white',
        border: 'none',
        padding: '10px 30px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    cancelBtn: {
        backgroundColor: '#d9534f',
        color: 'white',
        border: 'none',
        padding: '10px 30px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    footer: {
        backgroundColor: '#e0e0e0',
        padding: '8px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #ccc',
    },
    footerNav: {
        display: 'flex',
        gap: '5px',
        alignItems: 'center',
    },
    navBtn: {
        backgroundColor: 'white',
        border: '1px solid #aaa',
        padding: '4px 10px',
        cursor: 'pointer',
        fontSize: '12px',
    },
    recordCount: {
        marginLeft: '10px',
        fontSize: '11px',
    },
    footerButtons: {
        display: 'flex',
        gap: '10px',
    },
    footerBtn: {
        backgroundColor: '#5cb85c',
        color: 'white',
        border: 'none',
        padding: '6px 15px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 'bold',
    },
    footerBtnRed: {
        backgroundColor: '#d9534f',
        color: 'white',
        border: 'none',
        padding: '6px 15px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 'bold',
    },
};
