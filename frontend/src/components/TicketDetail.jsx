import { useState, useEffect } from "react";
import Select from 'react-select';
import PersonnelSelect from "./PersonnelSelect";
import { ticketsAPI, userApi, configurationAPI } from "../../services/api";
import { generateTicketPDF } from "../utils/pdfGenerator";

import { X, Save, Send, FileText, MessageSquare, History, AlertCircle, Download } from "lucide-react";

export default function TicketDetail({ ticketId, onClose }) {
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    //Available options for dropdowns 
    const [availablePersonnel, setAvailablePersonnel] = useState([]);
    const [availableSystems, setavailableSystems] = useState([]);
    const [availableSubSystems, setAvailableSubSystems] = useState([]);
    const [availableCIs, setAvailableCIs] = useState([]);
    const [availableComponents, setAvailableComponents] = useState([]);
    const [pdfReportDate, setPdfReportDate] = useState([]);

    useEffect(() => {
        loadConfiguration();
    }, []);

    const loadConfiguration = async () => {
        try {
            const configResponse = await configurationAPI.get();
            if (configResponse?.data?.pdfReportDate) {
                setPdfReportDate(configResponse.data.pdfReportDate);
            } else {
                // Fallback to current date if no configuration
                setPdfReportDate(new Date().toISOString());
            }
        } catch (error) {
            console.error('Error loading configuration:', error);
            // Fallback to current date on error
            setPdfReportDate(new Date().toISOString());
        }
    };


    const STATUS_LABELS = {
        'OPEN': 'AÇIK',
        'CLOSED': 'KAPANDI',
        'CONFIRMED': 'ONAYLANDI',
        'PAUSED': 'DURDURULDU',
        'REOPENED': 'TEKRAR AÇILDI',
        'CANCELLED': 'İPTAL'
    };

    const CONTROL_STATUS_OPTIONS = [
        { value: 0, label: "Teslim Edildi", color: "#ffc107", bg: "#fff3cd" },
        { value: 1, label: "Onaylandı", color: "#28a745", bg: "#d4edda" },
        { value: 2, label: "Onaylandı ve Basıldı", color: "#17a2b8", bg: "#d1ecf1" },
        { value: 3, label: "İmzalandı", color: "#6610f2", bg: "#e7e3fc" },
        { value: 4, label: "Kapandı ve Ödendi", color: "#20c997", bg: "#d2f4ea" },
        { value: 5, label: "İptal Edildi", color: "#dc3545", bg: "#f8d7da" },
    ];

    const getControlStatusConfig = (status) => {
        if (status === null || status === undefined) return null;
        return CONTROL_STATUS_OPTIONS.find(opt => opt.value === status);
    };

    const getStatusLabel = (status) => {
        return STATUS_LABELS[status] || status;
    };

    const handleGeneratePDF = async () => {

        if (!ticket) {
            alert("Ticket bilgileri yükleniyor, lütfen bekleyin...");
            return;
        }

        try {
            await generateTicketPDF(ticket, formData, pdfReportDate);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("PDF oluşturulurken hata oluştu");
        }
    };
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
        updatedAt: '',

        //Detection Fields
        detectedDate: '',
        detectedContractorNotifiedAt: '',
        detectedNotificationMethods: [],
        detectedDetectedByUserId: null,
        //Response fields
        responseDate: '',
        responseResolvedAt: '',
        responsePersonnelIds: [],
        responseResolvedPersonnelIds: [],
        responseActions: '',
        activityControlPersonnelId: null,  // For PERSONEL Rütbe & Adı Soyadı
        activityControlCommanderId: null,  // For İLK. KOM. Rütbe & Adı Soyadı
        activityControlDate: '',
        activityControlResult: '',
        activityControlStatus: null,
        ttcomsCode: '',

        newItemDescription: '',
        newItemId: '',
        newItemSerialNo: '',

        hpNo: '',
        tentativeSolutionDate: '', 
        subContractor: '', 
        subContractorNotifiedAt: ''


    });

    // Comments and actions
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);
    const [actions, setActions] = useState([]);
    // const [activeTab, setActiveTab] = useState('details');
    const [activeTab, setActiveTab] = useState('history');



    const userRole = localStorage.getItem("role");
    const isReadOnly = userRole === 'Viewer';
    const canEdit = userRole === 'Editor' || userRole === 'Admin';
    const isNewTicket = !ticketId || ticketId === 'new';
    const canViewComments = userRole === 'Editor' || userRole === 'Admin';



    const notificationMethodOptions = [
        { value: 'Email', label: 'Email' },
        { value: 'Phone', label: 'Telefon' },
        { value: 'InPerson', label: 'Yüz Yüze' },
        { value: 'SMS', label: 'SMS' },
        { value: 'System', label: 'Sistem' }
    ];


    useEffect(() => {
        loadAvailableData();
        if (!isNewTicket) {
            loadTicketDetails();
        } else {
            setLoading(false);
        }
    }, [ticketId]);


    const loadAvailableData = async () => {
        try {

            //Load personnel for dropdowns 
            const personnelResponse = await ticketsAPI.getAvailablePersonnel();
            setAvailablePersonnel(personnelResponse.data);


            // Load systems
            const systemsResponse = await ticketsAPI.getAvailableSystems();
            setavailableSystems(systemsResponse.data);

            const subsystemResponse = await ticketsAPI.getAvailableSubsystems(formData.systemId);
            setAvailableSubSystems(subsystemResponse.data);

            const cisResponse = await ticketsAPI.getAvailableCIs(formData.subsystemId);
            setAvailableCIs(cisResponse.data);

            // Load components if CI is selected
            const componentsResponse = await ticketsAPI.getAvailableComponents(formData.ciId);
            setAvailableComponents(componentsResponse.data);

        } catch (error) {
            console.error("Error loading the available personnel to select from a dropdown!!!");
        }


    };

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
                updatedAt: ticketData.updatedAt || '',
                // Detection Fields
                detectedDate: ticketData.detectedDate ? formatDateTimeLocal(ticketData.detectedDate) : "",
                detectedContractorNotifiedAt: ticketData.detectedContractorNotifiedAt ? formatDateTimeLocal(ticketData.detectedContractorNotifiedAt) : "",
                detectedNotificationMethods: ticketData.detectedNotificationMethods || [],
                detectedByUserId: ticketData.detectedByUserId || null,
                // Response Fields 

                responseDate: ticketData.responseDate ? formatDateTimeLocal(ticketData.responseDate) : "",
                responseResolvedAt: ticketData.responseResolvedAt ? formatDateTimeLocal(ticketData.responseResolvedAt) : "",
                responsePersonnelIds: ticketData.responsePersonnel?.map(p => p.userId) || [],
                responseResolvedPersonnelIds: ticketData.responseResolvedPersonnel?.map(p => p.userId) || [],
                responseActions: ticketData.responseActions || '',
                createdByName: ticketData.createdBy,

                // Activity Control fields (load from backend if available)
                activityControlPersonnelId: ticketData.activityControlPersonnelId || null,
                activityControlCommanderId: ticketData.activityControlCommanderId || null,
                activityControlDate: ticketData.activityControlDate ? formatDateTimeLocal(ticketData.activityControlDate) : '',
                activityControlResult: ticketData.activityControlResult || '',
                activityControlStatus: ticketData.activityControlStatus ?? null,
                ttcomsCode: ticketData.ttcomsCode || '',

                newItemDescription: ticketData.newItemDescription || null,
                newItemId: ticketData.newItemId || null,
                newItemSerialNo: ticketData.newItemSerialNo || null,
                hpNo: ticketData.hpNo || null,
                tentativeSolutionDate: ticketData.tentativeSolutionDate ? formatDateTimeLocal(ticketData.tentativeSolutionDate) : "",
                subContractor: ticketData.subContractor || null,
                subContractorNotifiedAt: ticketData.subContractorNotifiedAt ? formatDateTimeLocal(ticketData.subContractorNotifiedAt) : "",    

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

    // Handler for react-select multi-select
    const handleMultiSelectChange = (field, selectedOptions) => {
        const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
        handleInputChange(field, values);
    };

    // Handler for single select
    const handleSingleSelectChange = (field, selectedOption) => {
        const value = selectedOption ? selectedOption.value : null;
        handleInputChange(field, value);
    };

    const handleNotificationMethodsChange = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(options[i].value);
            }
        }
        handleInputChange('detectedNotificationMethods', selected);
    };


    const handleSystemChange = async (value) => {
        handleInputChange('systemId', value);
    };

    const handleSubsystemChange = async (value) => {
        handleInputChange('subsystemId', value);
    };

    const handleCIChange = async (value) => {
        handleInputChange('ciId', value);
    };

    const handleComponentChange = (value) => {
        handleInputChange('componentId', value);
    };


    const handleSave = async () => {
        if (!formData.title.trim()) {
            alert("Title is required");
            return;
        }
        try {
            setSaving(true);

            // Prepare data for API 

            const apiData = {
                ...formData,
                // Convert datetime-local to ISO format 
                detectedDate: formData.detectedDate ? new Date(formData.detectedDate).toISOString() : null,
                detectedContractorNotifiedAt: formData.detectedContractorNotifiedAt ? new Date(formData.detectedContractorNotifiedAt).toISOString() : null,
                responseDate: formData.responseDate ? new Date(formData.responseDate).toISOString() : null,
                responseResolvedAt: formData.responseResolvedAt ? new Date(formData.responseResolvedAt).toISOString() : null,
                activityControlDate: formData.activityControlDate ? new Date(formData.activityControlDate).toISOString() : null,
                tentativeSolutionDate: formData.tentativeSolutionDate ? new Date(formData.tentativeSolutionDate).toISOString() : null,
                subContractorNotifiedAt: formData.subContractorNotifiedAt ? new Date(formData.subContractorNotifiedAt).toISOString() : null,

            }

            if (isNewTicket) {
                const response = await ticketsAPI.create(apiData);
                alert("Ticket created successfully");
                if (onClose) onClose();
            } else {
                await ticketsAPI.update(ticketId, apiData);
                debugger;
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
            alert("Yeni bir islem eklenmistir.");
            loadTicketDetails();
        } catch (error) {
            console.error("Error adding comment:", error);
            alert("Error adding comment");
        }
    };

    const handleStatusChange = async (newStatus) => {
        const statusLabel = getStatusLabel(newStatus);
        if (!window.confirm(`Durumu "${statusLabel}" olarak değiştirmek istediğinize emin misiniz?`)) return;

        try {
            setSaving(true);

            const toISOOrNull = (dateString) => {
                if (!dateString || dateString === '') return null;
                return new Date(dateString).toISOString();
            };

            // Build apiData directly with the new status (don't rely on formData state)
            const apiData = {
                title: formData.title,
                description: formData.description,
                isBlocking: formData.isBlocking,
                technicalReportRequired: formData.technicalReportRequired,
                status: newStatus,  // ✅ Use the newStatus parameter directly

                ciId: formData.ciId || null,
                componentId: formData.componentId || null,
                subsystemId: formData.subsystemId || null,
                systemId: formData.systemId || null,

                detectedDate: toISOOrNull(formData.detectedDate),
                detectedContractorNotifiedAt: toISOOrNull(formData.detectedContractorNotifiedAt),
                detectedNotificationMethods: formData.detectedNotificationMethods || [],
                detectedByUserId: formData.detectedByUserId || null,

                responseDate: toISOOrNull(formData.responseDate),
                responseResolvedAt: toISOOrNull(formData.responseResolvedAt),
                responsePersonnelIds: formData.responsePersonnelIds || [],
                responseResolvedPersonnelIds: formData.responseResolvedPersonnelIds || [],
                responseActions: formData.responseActions || null,

                activityControlPersonnelId: formData.activityControlPersonnelId || null,
                activityControlCommanderId: formData.activityControlCommanderId || null,
                activityControlDate: toISOOrNull(formData.activityControlDate),
                activityControlResult: formData.activityControlResult || null,
            };

            await ticketsAPI.update(ticketId, apiData);
            alert(`Durum "${statusLabel}" olarak değiştirildi`);

            // Update local state after successful save
            setFormData(prev => ({ ...prev, status: newStatus }));

            // Reload to get fresh data from backend
            loadTicketDetails();
        } catch (error) {
            console.error("Error changing status:", error);
            alert("Durum değiştirilemedi: " + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };


    //Helper function to format date for datetime-local input 

    const formatDateTimeLocal = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;

    };


    // Get selected notification methods
    const selectedNotificationMethods = notificationMethodOptions.filter(option =>
        formData.detectedNotificationMethods?.includes(option.value)
    );

    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '42px',
            borderColor: state.isFocused ? '#667eea' : '#ddd',
            boxShadow: state.isFocused ? '0 0 0 1px #667eea' : 'none',
            '&:hover': {
                borderColor: '#667eea'
            }
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: '#e3f2fd',
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: '#1976d2',
            fontWeight: '500',
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: '#1976d2',
            ':hover': {
                backgroundColor: '#1976d2',
                color: 'white',
            },
        }),
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

                    {ticket && !isNewTicket && (
                        <button
                            onClick={handleGeneratePDF}
                            style={{ ...styles.button, ...styles.pdfButton }}
                            title="PDF Rapor Al"
                        >
                            <Download size={16} />
                            PDF Rapor
                        </button>
                    )}
                    {canEdit && (
                        <button
                            onClick={handleSave}
                            style={{ ...styles.button, ...styles.saveButton }}
                            disabled={saving}
                        >
                            <Save size={16} />
                            {saving ? 'Kaydediyot...' : 'Kaydet'}
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
                            Sistem Detay
                        </h2>
                        <p style={styles.sectionSubtitle}>
                            Seçim Sırası → Sistem → Alt Sistem → CI → Komponent sırasında seçiniz / değiştiriniz
                        </p>

                        <div style={styles.hierarchyContainer}>
                            <div style={styles.hierarchyRow}>
                                <div style={styles.hierarchyItem}>
                                    <label style={styles.label}>Sistem</label>
                                    <select
                                        value={formData.systemId || ''}
                                        onChange={(e) => handleSystemChange(e.target.value ? parseInt(e.target.value) : null)}
                                        style={styles.select}
                                        disabled={isReadOnly}
                                    >
                                        <option value="">Sistem Seç</option>
                                        {availableSystems.map(system => (
                                            <option key={system.id} value={system.id}>
                                                {system.code ? `${system.code} - ${system.name}` : system.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={styles.hierarchyItem}>
                                    <label style={styles.label}>Alt Sistem</label>
                                    <select
                                        value={formData.subsystemId || ''}
                                        onChange={(e) => handleSubsystemChange(e.target.value ? parseInt(e.target.value) : null)}
                                        style={styles.select}
                                        disabled={isReadOnly || !formData.systemId}
                                    >
                                        <option value="">Alt Sistem Seç</option>
                                        {availableSubSystems.map(subsystem => (
                                            <option key={subsystem.id} value={subsystem.id}>
                                                {subsystem.code ? `${subsystem.code} - ${subsystem.name}` : subsystem.name}
                                            </option>
                                        ))}
                                    </select>
                                    {!formData.systemId && (
                                        <small style={styles.helpText}>
                                            Önce sistem seçiniz
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div style={styles.hierarchyRow}>
                                <div style={styles.hierarchyItem}>
                                    <label style={styles.label}>CI (Konfigurasyon Birimi)</label>
                                    <select
                                        value={formData.ciId || ''}
                                        onChange={(e) => handleCIChange(e.target.value ? parseInt(e.target.value) : null)}
                                        style={styles.select}
                                        disabled={isReadOnly || !formData.subsystemId}
                                    >
                                        <option value="">CI Seç</option>
                                        {availableCIs.map(ci => (
                                            <option key={ci.id} value={ci.id}>
                                                {ci.code ? `${ci.code} - ${ci.name}` : ci.name}
                                            </option>
                                        ))}
                                    </select>
                                    {!formData.subsystemId && (
                                        <small style={styles.helpText}>
                                            Önce alt sistem seçiniz
                                        </small>
                                    )}
                                </div>

                                <div style={styles.hierarchyItem}>
                                    <label style={styles.label}>Komponent</label>
                                    <select
                                        value={formData.componentId || ''}
                                        onChange={(e) => handleInputChange('componentId', e.target.value ? parseInt(e.target.value) : null)}
                                        style={styles.select}
                                        disabled={isReadOnly || !formData.ciId}
                                    >
                                        <option value="">Komponent Seç</option>
                                        {availableComponents.map(component => (
                                            <option key={component.id} value={component.id}>
                                                {component.code ? `${component.code} - ${component.name}` : component.name}
                                            </option>
                                        ))}
                                    </select>
                                    {!formData.ciId && (
                                        <small style={styles.helpText}>
                                            Önce CI seçiniz
                                        </small>
                                    )}
                                </div>
                            </div>

                            {/* Rest of the section remains the same */}
                        </div>
                    </div>

                    {/* Bildirim Detayları */}
                    <div style={styles.formSection}>
                        <h2 style={styles.sectionTitle}>Tespit/Bildirim Detayları</h2>

                        <div style={styles.inlineGroup}>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Arıza No (Otomatik)</label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    value={formData.externalCode}
                                    disabled
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Tespit Edildiği Tarih</label>
                                <input
                                    type="datetime-local"
                                    value={formData.detectedDate}
                                    onChange={(e) => handleInputChange('detectedDate', e.target.value)}
                                    style={styles.input}
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Yükleniciye Bildirildiği Tarih</label>
                                <input
                                    type="datetime-local"
                                    value={formData.detectedContractorNotifiedAt}
                                    onChange={(e) => handleInputChange('detectedContractorNotifiedAt', e.target.value)}
                                    style={styles.input}
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>
                        <br />
                        <br />
                        <div style={styles.inlineGroup}>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Bildirim Şekli (Çoklu Seçim)</label>
                                <Select
                                    isMulti
                                    value={selectedNotificationMethods}
                                    onChange={(selected) => handleMultiSelectChange('detectedNotificationMethods', selected)}
                                    options={notificationMethodOptions}
                                    styles={customSelectStyles}
                                    placeholder="Bildirim şekli seçiniz..."
                                    isDisabled={isReadOnly}
                                    noOptionsMessage={() => "Seçenek bulunamadı"}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>TTCOMS TT Kodu (Varsa)</label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    disabled={isReadOnly}
                                    value={formData.ttcomsCode}
                                    onChange={(e) => handleInputChange('ttcomsCode', e.target.value)}
                                    placeholder="TT00001"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Tespit Eden Personel</label>
                                <PersonnelSelect
                                    isMulti={false}
                                    value={formData.detectedByUserId}
                                    onChange={(id) => handleInputChange('detectedByUserId', id)}
                                    isDisabled={isReadOnly}
                                    placeholder="Personel seçiniz..."
                                    showRank={true}
                                    showDepartment={true}
                                />
                            </div>
                        </div>

                        <br />
                        <div style={styles.inlineGroup}>
                            
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}> Alt Yüklenici</label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    disabled={isReadOnly}
                                    value={formData.subContractor}
                                    onChange={(e) => handleInputChange('subContractor', e.target.value)}
                                    placeholder="SDT"
                                />
                            </div>
                             <div style={{ flex: 1 }}>
                                <label style={styles.label}>Yükleniciye Bildirildiği Tarih</label>
                                <input
                                    type="datetime-local"
                                    value={formData.subContractorNotifiedAt}
                                    onChange={(e) => handleInputChange('subContractorNotifiedAt', e.target.value)}
                                    style={styles.input}
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Arızalı Malzeme Detayları */}
                    <div style={styles.formSection}>
                        <h2 style={styles.sectionTitle}>Arızalı Malzeme Detayları</h2>

                        <div style={styles.inlineGroup}>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Parça Tanımı</label>
                                <input
                                    type="input"
                                    value={formData.itemDescription}
                                    onChange={(e) => handleInputChange('itemDescription', e.target.value)}
                                    style={styles.input}
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Parça No</label>
                                <input
                                    type="input"
                                    value={formData.itemId}
                                    onChange={(e) => handleInputChange('itemId', e.target.value)}
                                    style={styles.input}
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Seri No</label>
                                <input
                                    type="input"
                                    value={formData.itemSerialNo}
                                    onChange={(e) => handleInputChange('itemSerialNo', e.target.value)}
                                    style={styles.input}
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>

                        <div style={styles.inlineGroup}>
                            <div style={{ flex: 1 }}>



                                <div style={styles.formRow}>

                                </div>
                            </div>

                        </div>




                    </div>

                    {/* Yeni Malzeme Detayları */}
                    <div style={styles.formSection}>
                        <h2 style={styles.sectionTitle}>Yeni Malzeme Detayları</h2>

                        <div style={styles.inlineGroup}>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Parça Tanımı</label>
                                <input
                                    type="input"
                                    value={formData.newItemDescription}
                                    onChange={(e) => handleInputChange('newItemDescription', e.target.value)}
                                    style={styles.input}
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Parça No</label>
                                <input
                                    type="input"
                                    value={formData.newItemId}
                                    onChange={(e) => handleInputChange('newItemId', e.target.value)}
                                    style={styles.input}
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Seri No</label>
                                <input
                                    type="input"
                                    value={formData.newItemSerialNo}
                                    onChange={(e) => handleInputChange('newItemSerialNo', e.target.value)}
                                    style={styles.input}
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>

                        <div style={styles.inlineGroup}>
                            <div style={{ flex: 1 }}>



                                <div style={styles.formRow}>

                                </div>
                            </div>

                        </div>




                    </div>


                    {/* Güncellenen Malzeme Detayları */}
                    <div style={styles.formSection}>
                        <h2 style={styles.sectionTitle}>Ek  Bilgi</h2>

                        <div style={styles.inlineGroup}>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>HP Arıza No</label>
                                <input
                                    type="input"
                                    value={formData.hpNo}
                                    onChange={(e) => handleInputChange('hpNo', e.target.value)}
                                    style={styles.input}
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Geçici Çözüm Tarihi</label>
                                <input
                                    type="datetime-local"
                                    value={formData.tentativeSolutionDate}
                                    onChange={(e) => handleInputChange('tentativeSolutionDate', e.target.value)}
                                    style={styles.input}
                                    disabled={isReadOnly}
                                />
                            </div>
                            {/* <div style={{ flex: 1 }}>
                                <label style={styles.label}>Seri No</label>
                                <input
                                    type="input"
                                    value={formData.itemSerialNo}
                                    onChange={(e) => handleInputChange('itemSerialNo', e.target.value)}
                                    style={styles.input}
                                    disabled={isReadOnly}
                                />
                            </div> */}
                        </div>

                        <div style={styles.inlineGroup}>
                            <div style={{ flex: 1 }}>



                                <div style={styles.formRow}>

                                </div>
                            </div>

                        </div>




                    </div>



                    {/* Müdahale Detayları */}
                    <div style={styles.formSection}>
                        <h2 style={styles.sectionTitle}>Arıza Müdahale Detayları</h2>

                        <div style={styles.inlineGroup}>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Müdahale Eden Personel(ler)</label>
                                <PersonnelSelect
                                    isMulti={true}
                                    value={formData.responsePersonnelIds}
                                    onChange={(ids) => handleInputChange('responsePersonnelIds', ids)}
                                    isDisabled={isReadOnly}
                                    placeholder="Personel seçiniz..."
                                    showRank={true}
                                    showDepartment={true}
                                />


                                {/* Display selected personnel */}
                                {/* {formData.responsePersonnelIds.length > 0 && (
                                    <div style={styles.selectedItems}>
                                        <strong>Seçilenler:</strong>
                                        <ul style={styles.selectedList}>
                                            {formData.responsePersonnelIds.map(id => {
                                                const person = availablePersonnel.find(p => p.id === id);
                                                return person ? (
                                                    <li key={id} style={styles.selectedItem}>
                                                        {person.displayName}
                                                    </li>
                                                ) : null;
                                            })}
                                        </ul>
                                    </div>
                                )} */}
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Müdahale Tarihi</label>
                                <input
                                    type="datetime-local"
                                    value={formData.responseDate}
                                    onChange={(e) => handleInputChange('responseDate', e.target.value)}
                                    style={styles.input}
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Giderildiği Tarih</label>
                                <input
                                    type="datetime-local"
                                    value={formData.responseResolvedAt}
                                    onChange={(e) => handleInputChange('responseResolvedAt', e.target.value)}
                                    style={styles.input}
                                    disabled={isReadOnly}
                                />
                            </div>

                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Sorunu Gideren Personel(ler)</label>
                                <PersonnelSelect
                                    isMulti={true}
                                    value={formData.responseResolvedPersonnelIds}
                                    onChange={(ids) => handleInputChange('responseResolvedPersonnelIds', ids)}
                                    isDisabled={isReadOnly}
                                    placeholder="Personel seçiniz..."
                                    showRank={true}
                                    showDepartment={true}
                                />
                            </div>
                        </div>




                        <div style={styles.formRow}>
                            <p><br></br></p>
                            <label style={styles.label}>Arızaya İlişkin Yapılan İşlemler</label>
                            <textarea
                                value={formData.responseActions}
                                onChange={(e) => handleInputChange('responseActions', e.target.value)}
                                style={{ ...styles.input, ...styles.textarea }}
                                rows={5}
                                placeholder="Yapılan işlemlerin özeti"
                                disabled={isReadOnly}
                            />
                        </div>
                    </div>

                    {/* Faaliyet Kontrolü */}
                    <div style={styles.formSection}>

                        <h2 style={styles.sectionTitle}>
                            Faaliyet Kontrolü
                            {/* ✅ Display status badge if exists */}
                            {formData.activityControlStatus !== null && formData.activityControlStatus !== undefined && (
                                <span style={{
                                    marginLeft: '1rem',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    backgroundColor: getControlStatusConfig(formData.activityControlStatus)?.bg || '#f5f5f5',
                                    color: getControlStatusConfig(formData.activityControlStatus)?.color || '#666',
                                }}>
                                    {getControlStatusConfig(formData.activityControlStatus)?.label || '-'}
                                </span>
                            )}
                        </h2>

                        <div style={styles.inlineGroup}>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Personel Rütbe & Adı Soyadı</label>
                                <PersonnelSelect
                                    isMulti={false}
                                    value={formData.activityControlPersonnelId}
                                    onChange={(id) => handleInputChange('activityControlPersonnelId', id)}
                                    isDisabled={isReadOnly}
                                    placeholder="Personel seçiniz..."
                                    showRank={true}
                                    showDepartment={false}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Böl. Kom. Rütbe & Adı Soyadı</label>
                                <PersonnelSelect
                                    isMulti={false}
                                    value={formData.activityControlCommanderId}
                                    onChange={(id) => handleInputChange('activityControlCommanderId', id)}
                                    isDisabled={isReadOnly}
                                    placeholder="Komutan seçiniz..."
                                    showRank={true}
                                    showDepartment={false}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Faaliyet Kontrol Tarihi</label>
                                <input
                                    type="datetime-local"
                                    value={formData.activityControlDate}
                                    onChange={(e) => handleInputChange('activityControlDate', e.target.value)}
                                    style={styles.input}
                                    disabled={isReadOnly}
                                />
                            </div>

                                <div style={{ flex: 1 }}>
                                    <label style={styles.label}>Kontrol Durumu</label>
                                    <select
                                        value={formData.activityControlStatus ?? ''}
                                        onChange={(e) => handleInputChange(
                                            'activityControlStatus',
                                            e.target.value === '' ? null : parseInt(e.target.value)
                                        )}
                                        style={styles.select}
                                        disabled={isReadOnly}
                                    >
                                        <option value="">Durum seçiniz...</option>
                                        {CONTROL_STATUS_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                            </div>
                        </div>

                        <div style={styles.formRow}>
                            <label style={styles.label}>Sonuç (FAAL / GAYRİ FAAL)</label>
                            <textarea
                                value={formData.activityControlResult}
                                onChange={(e) => handleInputChange('activityControlResult', e.target.value)}
                                style={{ ...styles.input, ...styles.textarea }}
                                rows={4}
                                placeholder="(Gayri faal ise gerçekçesi ve faaliyet için öneriler yazılacaktır.)"
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

                {/* Right Panel - Control Panel */}
                <div style={styles.rightPanel}>
                    {/* Status Control Panel */}
                    <div style={styles.statusPanel}>
                        <h3 style={styles.panelTitle}>Sorun Durumu</h3>

                        <div style={styles.statusBadgeContainer}>
                            <span style={{
                                ...styles.statusBadgeLarge,
                                backgroundColor: getStatusColor(formData.status),
                                color: getStatusTextColor(formData.status)
                            }}>
                                {getStatusLabel(formData.status)}
                            </span>
                        </div>

                        {ticket && canEdit && (
                            <div style={styles.statusActions}>
                                <button
                                    onClick={() => handleStatusChange('CLOSED')}
                                    style={{ ...styles.statusButton, ...styles.closeStatusButton }}
                                    disabled={formData.status === 'CLOSED'}
                                >
                                    KAPANDI
                                </button>
                                <button
                                    onClick={() => handleStatusChange('CONFIRMED')}
                                    style={{ ...styles.statusButton, ...styles.confirmButton }}
                                    disabled={formData.status === 'CONFIRMED'}
                                >
                                    ONAYLANDI
                                </button>
                                <button
                                    onClick={() => handleStatusChange('PAUSED')}
                                    style={{ ...styles.statusButton, ...styles.pauseButton }}
                                    disabled={formData.status === 'PAUSED'}
                                >
                                    DURDURULDU
                                </button>

                                <button
                                    onClick={() => handleStatusChange('REOPENED')}
                                    style={{ ...styles.statusButton, ...styles.reopenButton }}
                                    disabled={formData.status === 'REOPENED'}
                                >
                                    YENİDEN AÇILDI
                                </button>
                                <button
                                    onClick={() => handleStatusChange('CANCELLED')}
                                    style={{ ...styles.statusButton, ...styles.cancelButton }}
                                    disabled={formData.status === 'CANCELLED'}
                                >
                                    İPTAL EDİLDİ
                                </button>
                            </div>
                        )}

                        {ticket && (
                            <div style={styles.metadata}>
                                <div style={styles.metadataItem}>
                                    <span style={styles.metadataLabel}>Oluşturan:</span>
                                    <span>{ticket.createdByName}</span>
                                </div>
                                <div style={styles.metadataItem}>
                                    <span style={styles.metadataLabel}>Oluşturma Tarihi:</span>
                                    <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                                </div>
                                {ticket.updatedAt && (
                                    <div style={styles.metadataItem}>
                                        <span style={styles.metadataLabel}>Son Güncelleme:</span>
                                        <span>{new Date(ticket.updatedAt).toLocaleString()}</span>
                                    </div>
                                )}
                                {ticket.lastUpdatedByName && (
                                    <div style={styles.metadataItem}>
                                        <span style={styles.metadataLabel}>Son Güncelleyen:</span>
                                        <span>{ticket.lastUpdatedByName}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tabs for Comments and History */}
                    {ticket && (
                        <>
                            <div style={styles.tabContainer}>
                                {canViewComments && (
                                    <button
                                        onClick={() => setActiveTab('comments')}
                                        style={{
                                            ...styles.tab,
                                            ...(activeTab === 'comments' ? styles.activeTab : {})
                                        }}
                                    >
                                        <MessageSquare size={16} />
                                        Yapılan İşlemler ({comments.length})
                                    </button>
                                )}

                                <button
                                    onClick={() => setActiveTab('history')}
                                    style={{
                                        ...styles.tab,
                                        ...(activeTab === 'history' ? styles.activeTab : {})
                                    }}
                                >
                                    <History size={16} />
                                    Tarihçe ({actions.length})
                                </button>
                            </div>

                            {/* Comments Tab */}
                            {activeTab === 'comments' && (
                                <div style={styles.tabContent}>
                                    {(
                                        <div style={styles.commentInputSection}>
                                        <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Yeni bir işlem adımı ekleyiniz..."
                                                style={{ ...styles.input, ...styles.textarea }}
                                                rows={3}
                                            />
                                            <button
                                                onClick={handleAddComment}
                                                style={{ ...styles.button, ...styles.addCommentButton }}
                                            >
                                                <Send size={16} />
                                                İşlem Ekle
                                            </button>
                                        </div>
                                    )}

                                    <div style={styles.commentsContainer}>
                                        {comments.length === 0 ? (
                                            <p style={styles.emptyMessage}>Henüz işlem kaydı yok</p>
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
                                            <p style={styles.emptyMessage}>Henüz tarihçe kaydı yok</p>
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

    //For the multiple selection 

    // Add these new styles for multi-select
    helpText: {
        display: 'block',
        marginTop: '0.25rem',
        fontSize: '0.75rem',
        color: '#666',
        fontStyle: 'italic',
    },
    selectedItems: {
        marginTop: '0.75rem',
        padding: '0.5rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
    },
    selectedList: {
        margin: '0.5rem 0 0 0',
        padding: '0 0 0 1.5rem',
        listStyle: 'disc',
    },
    selectedItem: {
        fontSize: '0.85rem',
        color: '#333',
        padding: '0.2rem 0',
    },

    cancelButton: {
        backgroundColor: '#ffebee',
        color: '#d32f2f',
    },

    // End for the multiple selection

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
    pdfButton: {
        backgroundColor: '#2196f3',
        color: 'white',
    },
};