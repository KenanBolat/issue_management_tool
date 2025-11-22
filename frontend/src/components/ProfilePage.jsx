import { useEffect, useState } from 'react';
import { userApi } from '../../services/api';
import { Save, Key } from 'lucide-react';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [militaryRanks, setMilitaryRanks] = useState([]);

    const [user, setUser] = useState(null);

    const [profileForm, setProfileForm] = useState({
        department: '',
        militaryRankId: null,
        phoneNumber: '',
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });





    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            alert('Lütfen mevcut ve yeni şifreyi doldurunuz.');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            alert('Yeni şifre ile şifre tekrarı uyuşmuyor.');
            return;
        }

        try {
            setSavingPassword(true);

            await userApi.changePassword(
                user.id,
                passwordForm.currentPassword,
                passwordForm.newPassword
            );

            alert('Şifreniz başarıyla güncellendi.');

            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });

        } catch (err) {
            console.error('Failed to change password', err);
            alert(err.message || 'Şifre değiştirilirken bir hata oluştu.');
        } finally {
            setSavingPassword(false);
        }
    };


    const isMilitaryAffiliation = (affiliation) =>
        ['Airforce', 'Navy', 'Army', 'Marines', 'CoastGuard'].includes(affiliation);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [userRes, ranksRes] = await Promise.all([
                    userApi.getMyProfile(),
                    userApi.getRanks(),
                ]);

                const u = userRes.data;
                setUser(u);
                setProfileForm({
                    department: u.department || '',
                    militaryRankId: u.militaryRankId || null,
                    phoneNumber: u.phoneNumber || '',
                });

                setMilitaryRanks(ranksRes.data || []);
            } catch (err) {
                console.error('Failed to load profile', err);
                alert('Profil bilgileri yüklenemedi.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleProfileChange = (field, value) => {
        setProfileForm((prev) => ({ ...prev, [field]: value }));
    };

    const handlePasswordChange = (field, value) => {
        setPasswordForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            setSavingProfile(true);

            // Only send editable fields
            const payload = {
                department: profileForm.department,
                militaryRankId: profileForm.militaryRankId,
                phoneNumber: profileForm.phoneNumber,
            };

            await userApi.update(user.id, payload);
            alert('Profiliniz başarıyla güncellendi.');
        } catch (err) {
            console.error('Failed to save profile', err);
            alert(err.response?.data?.message || 'Profil güncellenirken bir hata oluştu.');
        } finally {
            setSavingProfile(false);
        }
    };



    if (loading) {
        return <div style={styles.loading}>Profil yükleniyor...</div>;
    }

    if (!user) {
        return <div style={styles.loading}>Profil bulunamadı.</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Profilim</h1>
            </div>

            <div style={styles.form}>
                <div style={styles.formGrid}>
                    {/* LEFT – READONLY ACCOUNT INFO + PASSWORD */}
                    <div style={styles.formSection}>
                        <h2 style={styles.sectionTitle}>Hesap Bilgisi</h2>

                        <div style={styles.formRow}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                style={{ ...styles.input, backgroundColor: '#f0f0f0' }}
                            />
                        </div>

                        <div style={styles.formRow}>
                            <label style={styles.label}>Ad Soyad</label>
                            <input
                                type="text"
                                value={user.displayName}
                                disabled
                                style={{ ...styles.input, backgroundColor: '#f0f0f0' }}
                            />
                        </div>

                        <div style={styles.formRow}>
                            <label style={styles.label}>Yetki</label>
                            <input
                                type="text"
                                value={user.role}
                                disabled
                                style={{ ...styles.input, backgroundColor: '#f0f0f0' }}
                            />
                        </div>

                        <div style={styles.formRow}>
                            <label style={styles.label}>Telefon</label>
                            <input
                                type="tel"
                                value={profileForm.phoneNumber}
                                onChange={(e) =>
                                    handleProfileChange('phoneNumber', e.target.value)
                                }
                                style={styles.input}
                                placeholder="+90 555 123 45 67"
                            />
                        </div>

                        {/* Change password card */}
                        <div style={{ marginTop: '2rem' }}>
                            <h2 style={styles.sectionTitle}>
                                <Key size={16} style={{ marginRight: 8 }} />
                                Şifre Değiştir
                            </h2>
                            <form onSubmit={handlePasswordSubmit}>
                                <div style={styles.formRow}>
                                    <label style={styles.label}>Mevcut Şifre</label>
                                    <input
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) =>
                                            handlePasswordChange('currentPassword', e.target.value)
                                        }
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formRow}>
                                    <label style={styles.label}>Yeni Şifre</label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) =>
                                            handlePasswordChange('newPassword', e.target.value)
                                        }
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formRow}>
                                    <label style={styles.label}>Yeni Şifre (Tekrar)</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmNewPassword}
                                        onChange={(e) =>
                                            handlePasswordChange(
                                                'confirmNewPassword',
                                                e.target.value
                                            )
                                        }
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formActions}>
                                    <button
                                        type="submit"
                                        style={styles.saveButton}
                                        disabled={savingPassword}
                                    >
                                        <Save size={16} />
                                        {savingPassword ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT – ORG INFO (RANK + DEPARTMENT) */}
                    <div style={styles.formSection}>
                        <h2 style={styles.sectionTitle}>Organizasyon Bilgisi</h2>

                        <div style={styles.formRow}>
                            <label style={styles.label}>Kurum</label>
                            <input
                                type="text"
                                value={user.affiliation}
                                disabled
                                style={{ ...styles.input, backgroundColor: '#f0f0f0' }}
                            />
                        </div>

                        {isMilitaryAffiliation(user.affiliation) && (
                            <div style={styles.formRow}>
                                <label style={styles.label}>Rütbe</label>
                                <select
                                    value={profileForm.militaryRankId || ''}
                                    onChange={(e) =>
                                        handleProfileChange(
                                            'militaryRankId',
                                            e.target.value ? parseInt(e.target.value, 10) : null
                                        )
                                    }
                                    style={styles.select}
                                >
                                    <option value="">Seçiniz</option>
                                    {militaryRanks.map((rank) => (
                                        <option key={rank.id} value={rank.id}>
                                            {rank.displayName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={styles.formRow}>
                            <label style={styles.label}>Birim</label>
                            <input
                                type="text"
                                value={profileForm.department}
                                onChange={(e) =>
                                    handleProfileChange('department', e.target.value)
                                }
                                style={styles.input}
                                placeholder="e.g., Ağ Alt Yapısı, Görüntü İşleme Zinciri"
                            />
                        </div>

                        <div style={styles.formRow}>
                            <div style={styles.infoBox}>
                                <strong>Hesap Tipi:</strong> {user.role}
                                <br />
                                <strong>Organizasyon:</strong> {user.affiliation}
                                {isMilitaryAffiliation(user.affiliation) &&
                                    profileForm.militaryRankId && (
                                        <>
                                            <br />
                                            <strong>Askeri Birim:</strong> Evet
                                        </>
                                    )}
                            </div>
                        </div>

                        <form onSubmit={handleProfileSubmit}>
                            <div style={styles.formActions}>
                                <button
                                    type="submit"
                                    style={styles.saveButton}
                                    disabled={savingProfile}
                                >
                                    <Save size={16} />
                                    {savingProfile ? 'Kaydediliyor...' : 'Profil Bilgilerini Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Styles copied from UserForm for cohesive look
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
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
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
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #eee',
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
};
