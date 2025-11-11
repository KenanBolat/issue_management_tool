import { useEffect, useState } from 'react';
import Select from 'react-select';
import { ticketsAPI } from '../../services/api';

/**
 * Reusable Personnel Select Component
 * Supports both single and multi-select modes
 * 
 * @param {boolean} isMulti - Enable multi-select mode
 * @param {number|number[]|null} value - Selected value(s) - single ID for single-select, array of IDs for multi-select
 * @param {function} onChange - Callback when selection changes - receives single ID or array of IDs
 * @param {boolean} isDisabled - Disable the select
 * @param {string} placeholder - Placeholder text
 * @param {boolean} showRank - Show military rank in label
 * @param {boolean} showDepartment - Show department in label
 * @param {object} customStyles - Custom styles for react-select
 */
export default function PersonnelSelect({
    isMulti = false,
    value = null,
    onChange,
    isDisabled = false,
    placeholder = "Personel seçiniz...",
    showRank = true,
    showDepartment = true,
    customStyles = {}
}) {
    const [availablePersonnel, setAvailablePersonnel] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPersonnel();
    }, []);

    const loadPersonnel = async () => {
        try {
            
            setLoading(true);
            setError(null);
            const response = await ticketsAPI.getAvailablePersonnel();
            setAvailablePersonnel(response.data);
        } catch (err) {
            console.error('Error loading personnel:', err);
            setError('Personel listesi yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    // Convert personnel data to react-select options format
    const personnelOptions = availablePersonnel.map(person => {
        // Build label based on options
        let label = person.displayName;
        const details = [];
        if (showRank && person.rankCode) {
            details.push(person.rankCode);
        }
        if (showDepartment && person.department) {
            details.push(person.department);
        }
        
        if (details.length > 0) {
            label = `(${details.join(' - ')}) ${person.displayName} `;
        }

        return {
            value: person.id,
            label: label,
            data: person // Keep full data for reference if needed
        };
    });

    // Get selected option(s) based on value
    const getSelectedOption = () => {
        if (isMulti) {
            // Multi-select: value should be an array of IDs
            const selectedIds = Array.isArray(value) ? value : [];
            return personnelOptions.filter(option => selectedIds.includes(option.value));
        } else {
            // Single-select: value should be a single ID
            return personnelOptions.find(option => option.value === value) || null;
        }
    };

    // Handle selection change
    const handleChange = (selected) => {
        if (isMulti) {
            // Multi-select: return array of IDs
            const ids = selected ? selected.map(option => option.value) : [];
            onChange(ids);
        } else {
            // Single-select: return single ID or null
            const id = selected ? selected.value : null;
            onChange(id);
        }
    };

    // Default styles
    const defaultStyles = {
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

    // Merge custom styles with defaults
    const mergedStyles = {
        ...defaultStyles,
        ...customStyles,
        control: (base, state) => ({
            ...defaultStyles.control(base, state),
            ...(customStyles.control ? customStyles.control(base, state) : {})
        })
    };

    if (error) {
        return (
            <div style={{ 
                padding: '0.6rem', 
                border: '1px solid #f44336', 
                borderRadius: '4px',
                backgroundColor: '#ffebee',
                color: '#c62828',
                fontSize: '0.9rem'
            }}>
                {error}
            </div>
        );
    }

    return (
        <Select
            isMulti={isMulti}
            value={getSelectedOption()}
            onChange={handleChange}
            options={personnelOptions}
            styles={mergedStyles}
            placeholder={placeholder}
            isClearable={!isMulti} // Single-select can be cleared, multi-select has individual X buttons
            isDisabled={isDisabled || loading}
            isLoading={loading}
            noOptionsMessage={() => "Personel bulunamadı"}
            loadingMessage={() => "Yükleniyor..."}
        />
    );
}