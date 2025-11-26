import { useState, useEffect } from 'react';
import { userApi, configurationAPI, militaryRanksAPI } from '../../services/api.jsx';
import { UserPlus, Edit2, Trash2, Save, X, Download, Shield, ShieldOff, Plus, MinusCircle, FileText, Edit } from 'lucide-react';

export default function UserList({ onViewUser, onEditUser, onCreateUser, onManagePermissions, onDeleteUser }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [affiliationFilter, setAffiliationFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);


    const [configuration, setConfiguration] = useState(null);
    const [reportDate, setReportDate] = useState('');
    const [savingConfig, setSavingConfig] = useState(false);

    const [militaryRanks, setMilitaryRanks] = useState([]);
    const [showRankForm, setShowRankForm] = useState(false);
    const [editingRank, setEditingRank] = useState(null);
    const [rankFormData, setRankFormData] = useState({
        code: '',
        displayName: '',
        description: '',
        sortOrder: ''
    });



    const userRole = localStorage.getItem('role');
    const isAdmin = userRole === 'Admin';


    useEffect(() => {
        loadUsers();
        loadConfiguration();
        loadMilitaryRanks();


    }, [showInactive]);


    const loadMilitaryRanks = async () => {
        try {
            const response = await militaryRanksAPI.getAll();
            setMilitaryRanks(response.data);
        } catch (error) {
            console.error('Error loading military ranks:', error);
        }
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await userApi.getAll(showInactive);
            setUsers(response.data || []);
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Failed to load users. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const loadConfiguration = async () => {
        try {
            const response = await configurationAPI.get();
            setConfiguration(response.data);

            // Convert UTC date to local datetime-local format
            const pdfDate = new Date(response.data.pdfReportDate);
            const localDateTime = formatDateTimeLocal(pdfDate);
            setReportDate(localDateTime);
        } catch (error) {
            console.error("Failed to load configuration", error);
            // Fallback to current date
            setReportDate(formatDateTimeLocal(new Date()));
        }
    };

    const formatDateTimeLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };


    const handleAddRank = () => {
        setEditingRank(null);
        setRankFormData({
            code: '',
            displayName: '',
            description: '',
            sortOrder: ''
        });
        setShowRankForm(true);
    };

    const handleEditRank = (rank) => {
        setEditingRank(rank);
        setRankFormData({
            code: rank.code,
            displayName: rank.displayName,
            description: rank.description || '',
            sortOrder: rank.sortOrder.toString()
        });
        setShowRankForm(true);
    };

    const handleSaveRank = async () => {
        try {
            const data = {
                code: rankFormData.code,
                displayName: rankFormData.displayName,
                description: rankFormData.description || null,
                sortOrder: rankFormData.sortOrder ? parseInt(rankFormData.sortOrder) : null
            };

            if (editingRank) {
                await militaryRanksAPI.update(editingRank.id, data);
            } else {
                await militaryRanksAPI.create(data);
            }

            setShowRankForm(false);
            loadMilitaryRanks();
            alert(editingRank ? 'Rütbe güncellendi' : 'Rütbe eklendi');
        } catch (error) {
            console.error('Error saving rank:', error);
            alert('Rütbe kaydedilemedi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteRank = async (id) => {
        if (!window.confirm('Bu rütbeyi silmek istediğinize emin misiniz?')) return;

        try {
            await militaryRanksAPI.delete(id);
            loadMilitaryRanks();
            alert('Rütbe silindi');
        } catch (error) {
            console.error('Error deleting rank:', error);
            alert('Rütbe silinemedi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleToggleRankActive = async (id, isActive) => {
        try {
            if (isActive) {
                await militaryRanksAPI.deactivate(id);
            } else {
                await militaryRanksAPI.activate(id);
            }
            loadMilitaryRanks();
        } catch (error) {
            console.error('Error toggling rank:', error);
        }
    };


    const handleSaveConfiguration = async () => {
        if (!window.confirm('Rapor basım tarihini güncellemek istediğinize emin misiniz?')) {
            return;
        }

        try {
            setSavingConfig(true);

            // Convert local datetime to UTC
            const pdfDate = new Date(reportDate);

            const response = await configurationAPI.update({
                pdfReportDate: pdfDate.toISOString(),
                expirationDate: configuration?.expirationDate || null
            });

            setConfiguration(response.data);
            alert('Konfigürasyon başarıyla güncellendi!');
        } catch (error) {
            console.error('Error saving configuration:', error);
            alert('Konfigürasyon güncellenirken hata oluştu: ' + error.message);
        } finally {
            setSavingConfig(false);
        }
    };

    const handleResetReportDate = () => {
        const now = new Date();
        setReportDate(formatDateTimeLocal(now));
    };

    const handleRestoreUser = async (userId) => {
        if (!window.confirm('Bu kullanıcıyı geri yüklemek istediğinize emin misiniz?')) {
            return;
        }

        try {
            await userApi.restore(userId);
            alert('Kullanıcı başarıyla geri yüklendi!');
            loadUsers();
        } catch (error) {
            console.error('Error restoring user:', error);
            alert('Kullanıcı geri yüklenirken hata oluştu!');
        }
    };


    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await userApi.delete(userId);
            alert('User deleted successfully.');
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Please try again later.');
        }
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            Admin: '#d32f2f',
            Editor: '#f57c00',
            Viewer: '#1976d2',
        };
        return colors[role] || '#666';
    };

    const getAffiliationBadgeColor = (affiliation) => {
        const colors = {
            Airforce: '#2196f3',
            Navy: '#0d47a1',
            Army: '#388e3c',
            Marines: '#d32f2f',
            CoastGuard: '#ff6f00',
            Internal: '#7b1fa2',
            External: '#616161',
        };
        return colors[affiliation] || '#9e9e9e';
    };


    //Filtering  
    const filteredUsers = users.filter(user => {
        if (searchText) {
            const search = searchText.toLowerCase();
            const matchesSearch =
                user.displayName.toLowerCase().includes(search) ||
                user.email.toLowerCase().includes(search) ||
                (user.department && user.department.toLowerCase().includes(search));
            if (!matchesSearch) return false;
        }
        if (affiliationFilter && user.affiliation !== affiliationFilter) return false;
        if (roleFilter && user.role !== roleFilter) return false;

        return true;
    });


    // Check Admin Access
    if (!isAdmin) {
        return (
            <div style={styles.container}>
                <div style={styles.noAccess}>
                    <h2>Access Denied 1</h2>
                    <p>Only administrators can view the users list.</p>
                </div>
            </div>
        );
    }

    return (

        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Kullanıcı Kontrol Paneli</h1>
                    <p style={styles.subtitle}>
                        {filteredUsers.length} / {users.length}  kullanıcı gösterilmektedir.
                    </p>
                </div>
            </div>

            <div style={styles.controls}>
                <div style={styles.filterGroup}>
                    <input
                        type="text"
                        placeholder="Kullanıcı Ara..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={styles.searchInput}
                    />

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={styles.select}
                    >
                        <option value="">Erişim İzinleri</option>
                        <option value="Admin">Yönetici</option>
                        <option value="Editor">Editör</option>
                        <option value="Viewer">Görüntüleyici</option>
                    </select>

                    <select
                        value={affiliationFilter}
                        onChange={(e) => setAffiliationFilter(e.target.value)}
                        style={styles.select}
                    >
                        <option value="">Kurumlar</option>
                        <option value="Airforce">Hava Kuvvetleri</option>
                        <option value="Internal">TUSAS</option>
                        <option value="External">Yüklenici</option>
                    </select>

                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={(e) => setShowInactive(e.target.checked)}
                            style={styles.checkbox}
                        />
                        Aktif Olmayan Kullanıcılar
                    </label>

                    <button onClick={loadUsers} style={styles.refreshBtn}>
                        Yenile
                    </button>
                </div>

                <button onClick={onCreateUser} style={styles.addBtn}>
                    + Yeni Kullanıcı Ekle
                </button>
            </div>



            {loading ? (
                <div style={styles.loading}>Loading users...</div>
            ) : filteredUsers.length === 0 ? (
                <div style={styles.emptyState}>
                    <p>No users found</p>
                </div>
            ) : (
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>İsim</th>
                                <th style={styles.th}>E-posta</th>
                                <th style={styles.th}>Rol</th>
                                <th style={styles.th}>Kurum</th>
                                <th style={styles.th}>Rütbe</th>
                                <th style={styles.th}>Birim</th>
                                <th style={styles.th}>Telefon</th>
                                <th style={styles.th}>Durum</th>
                                <th style={styles.th}>Ayarlar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <strong>{user.displayName}</strong>
                                    </td>
                                    <td style={styles.td}>{user.email}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.roleBadge,
                                            backgroundColor: getRoleBadgeColor(user.role),
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.affiliationBadge,
                                            backgroundColor: getAffiliationBadgeColor(user.affiliation),
                                        }}>
                                            {user.affiliation}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {user.militaryRank || '-'}
                                    </td>
                                    <td style={styles.td}>{user.department || '-'}</td>
                                    <td style={styles.td}>{user.phoneNumber || '-'}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: user.isActive ? '#e8f5e9' : '#ffebee',
                                            color: user.isActive ? '#388e3c' : '#d32f2f',
                                        }}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            {/* <button
                                                style={styles.actionBtn}
                                                title="View Details"
                                                onClick={() => onViewUser(user.id)}
                                            >
                                                <Eye size={16} />
                                            </button> */}
                                            <button
                                                style={styles.actionBtn}
                                                title="Edit User"
                                                onClick={() => onEditUser(user.id)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {/* <button
                                                style={{ ...styles.actionBtn, color: '#7b1fa2' }}
                                                title="Manage Permissions"
                                                onClick={() => onManagePermissions(user.id)}
                                            >
                                                <Shield size={16} />
                                            </button> */}

                                            {!user.isActive ? (
                                                <button
                                                    onClick={() => handleRestoreUser(user.id)}
                                                    style={{ ...styles.actionBtn, color: '#d32f2f' }}
                                                    title="Geri Yükle"
                                                >
                                                    <RotateCcw size={18} />
                                                </button>
                                            ) : (<> </>)}
                                            <button
                                                style={{ ...styles.actionBtn, color: '#d32f2f' }}
                                                title="Delete User"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>


                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}


            <div style={styles.reportSection}>
                <h3 style={styles.reportTitle}>
                    <FileText size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Rapor Basım Tarihi
                </h3>
                <div style={styles.reportDateContainer}>
                    <input
                        type="datetime-local"
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                        style={styles.dateInput}
                    />
                    <button
                        onClick={handleResetReportDate}
                        style={styles.resetButton}
                        title="Şimdiki zamana sıfırla"
                    >
                        Şimdi
                    </button>
                    <button
                        onClick={handleSaveConfiguration}
                        disabled={savingConfig}
                        style={{ ...styles.button, ...styles.resetButton }}
                        title="Kaydet"
                    >
                        <Save size={18} style={{ marginRight: '8px' }} />
                        {savingConfig ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                    <div style={styles.dateInfo}>
                        <span style={styles.infoLabel}>Seçili Tarih:</span>
                        <span style={styles.infoValue}>
                            {new Date(reportDate).toLocaleString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                </div>

                {configuration && (
                    <div style={styles.configInfo}>
                        <p style={styles.configInfoText}>
                            <strong>Son Güncelleme:</strong>{' '}
                            {new Date(configuration.updatedDate).toLocaleString('tr-TR')}
                            {configuration.updatedByName && ` • ${configuration.updatedByName}`}
                        </p>
                    </div>
                )}

                <p style={styles.reportNote}>
                    ℹ️ Bu tarih, oluşturulan tüm PDF raporlarında onay tarihi olarak kullanılacaktır.
                </p>
            </div>

            <div style={styles.rankSection}>
                <div style={styles.rankHeader}>
                    <h2 style={styles.reportTitle}>
                        Rütbe Yönetimi
                    </h2>
                    <button onClick={handleAddRank} style={styles.addBtn}>
                        + Yeni Rütbe Ekle
                    </button>
                </div>
                {showRankForm && (
                    <div style={styles.rankForm}>
                        <div style={styles.rankFormGrid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Kod *</label>
                                <input
                                    type="text"
                                    value={rankFormData.code}
                                    onChange={(e) => setRankFormData({ ...rankFormData, code: e.target.value })}
                                    placeholder="Örn: ALBAY"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Görünen İsim *</label>
                                <input
                                    type="text"
                                    value={rankFormData.displayName}
                                    onChange={(e) => setRankFormData({ ...rankFormData, displayName: e.target.value })}
                                    placeholder="Örn: Albay"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Açıklama</label>
                                <input
                                    type="text"
                                    value={rankFormData.description}
                                    onChange={(e) => setRankFormData({ ...rankFormData, description: e.target.value })}
                                    placeholder="Opsiyonel açıklama"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Sıralama</label>
                                <input
                                    type="number"
                                    value={rankFormData.sortOrder}
                                    onChange={(e) => setRankFormData({ ...rankFormData, sortOrder: e.target.value })}
                                    placeholder="Boş bırakılırsa otomatik"
                                    style={styles.input}
                                />
                            </div>
                        </div>
                        <div style={styles.rankFormActions}>
                            <button
                                onClick={() => setShowRankForm(false)}
                                style={styles.cancelButton}
                            >
                                <X size={16} />
                                İptal
                            </button>
                            <button
                                onClick={handleSaveRank}
                                disabled={!rankFormData.code || !rankFormData.displayName}
                                style={{
                                    ...styles.saveButton,
                                    ...(!rankFormData.code || !rankFormData.displayName ? styles.saveButtonDisabled : {})
                                }}
                            >
                                <Save size={16} />
                                {editingRank ? 'Güncelle' : 'Ekle'}
                            </button>
                        </div>
                    </div>
                )}

                <div style={styles.rankTable}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Kod</th>
                                <th style={styles.th}>Görünen İsim</th>
                                <th style={styles.th}>Açıklama</th>
                                <th style={styles.th}>Sıralama</th>
                                <th style={styles.th}>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {militaryRanks.map((rank) => (
                                <tr key={rank.id} style={{
                                    ...styles.tr,
                                    ...(rank.isActive ? {} : styles.inactiveRow)
                                }}>
                                    <td style={styles.td}>{rank.code}</td>
                                    <td style={styles.td}>{rank.displayName}</td>
                                    <td style={styles.td}>{rank.description || '-'}</td>
                                    <td style={styles.td}>{rank.sortOrder}</td>

                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            <button
                                                onClick={() => handleEditRank(rank)}
                                                style={styles.iconButton}
                                                title="Düzenle"
                                            >
                                                <Edit2 size={16} />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteRank(rank.id)}
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
                    </table>
                </div>
            </div>


        </div>







    );
}

const styles = {
    container: {
        padding: '2rem',
        maxWidth: '1800px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: 0,
    },
    subtitle: {
        color: '#666',
        fontSize: '0.9rem',
        margin: '0.5rem 0 0 0',
    },
    controls: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    filterGroup: {
        display: 'flex',
        gap: '1rem',
        flex: 1,
        flexWrap: 'wrap',
    },
    searchInput: {
        padding: '0.6rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        flex: 1,
        maxWidth: '300px',
    },
    select: {
        padding: '0.6rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        minWidth: '130px',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem',
        fontSize: '0.9rem',
    },
    checkbox: {
        width: '16px',
        height: '16px',
    },
    refreshBtn: {
        padding: '0.6rem 1.2rem',
        background: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    addBtn: {
        padding: '0.6rem 1.2rem',
        background: '#4caf50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    loading: {
        textAlign: 'center',
        padding: '3rem',
        color: '#666',
        fontSize: '1.2rem',
    },
    emptyState: {
        textAlign: 'center',
        padding: '3rem',
        background: 'white',
        borderRadius: '8px',
        color: '#666',
    },
    noAccess: {
        textAlign: 'center',
        padding: '3rem',
        background: 'white',
        borderRadius: '8px',
    },
    tableWrapper: {
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '1200px',
    },
    th: {
        padding: '1rem',
        textAlign: 'left',
        background: '#f8f9fa',
        fontWeight: '600',
        borderBottom: '2px solid #dee2e6',
        fontSize: '0.85rem',
    },
    tr: {
        borderBottom: '1px solid #dee2e6',
    },
    td: {
        padding: '1rem',
        fontSize: '0.9rem',
    },
    roleBadge: {
        padding: '0.3rem 0.8rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: 'white',
        textTransform: 'uppercase',
    },
    affiliationBadge: {
        padding: '0.3rem 0.8rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '500',
        color: 'white',
    },
    statusBadge: {
        padding: '0.3rem 0.8rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '500',
    },
    actions: {
        display: 'flex',
        gap: '0.5rem',
    },
    actionBtn: {
        padding: '0.4rem',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#667eea',
        display: 'flex',
        alignItems: 'center',
    },
    reportSection: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginTop: '2rem',
    },
    reportTitle: {
        fontSize: '1.3rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
    },
    reportDateContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
    },
    dateInput: {
        padding: '0.75rem',
        fontSize: '1rem',
        border: '2px solid #dee2e6',
        borderRadius: '6px',
        minWidth: '250px',
        cursor: 'pointer',
    },
    resetButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    dateInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    infoLabel: {
        fontSize: '0.85rem',
        color: '#666',
    },
    infoValue: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#333',
    },
    reportNote: {
        margin: '1rem 0 0 0',
        padding: '1rem',
        backgroundColor: '#f0f7ff',
        borderLeft: '4px solid #667eea',
        color: '#333',
        fontSize: '0.9rem',
        borderRadius: '4px',
    },
    rankSection: {
        marginTop: '2rem',
        background: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    rankHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    addRankButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'all 0.2s',
    },
    rankForm: {
        background: '#f0f2ff',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '2px solid #667eea',
    },
    rankFormGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        marginBottom: '1rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#333',
    },
    input: {
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    rankFormActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
    },
    cancelButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        background: 'white',
        color: '#666',
        border: '1px solid #ddd',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'all 0.2s',
    },
    saveButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'all 0.2s',
    },
    saveButtonDisabled: {
        background: '#ccc',
        cursor: 'not-allowed',
    },
    rankTable: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
    },
    th: {
        padding: '1rem',
        textAlign: 'left',
        fontWeight: '600',
        color: '#333',
        borderBottom: '2px solid #eee',
        backgroundColor: '#f8f9fa',
    },
    tr: {
        borderBottom: '1px solid #eee',
        transition: 'background-color 0.2s',
    },
    td: {
        padding: '1rem',
        color: '#666',
    },
    inactiveRow: {
        backgroundColor: '#f8f9fa',
        opacity: 0.6,
    },
    statusBadge: {
        padding: '0.35rem 0.85rem',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        display: 'inline-block',
    },
    activeStatus: {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
    },
    inactiveStatus: {
        backgroundColor: '#ffebee',
        color: '#c62828',
    },
    actions: {
        display: 'flex',
        gap: '0.5rem',
    },
    iconButton: {
        padding: '0.5rem',
        background: '#e3f2fd',
        color: '#1976d2',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    },
    deleteButton: {
        padding: '0.5rem',
        background: '#ffebee',
        color: '#c62828',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    },

};