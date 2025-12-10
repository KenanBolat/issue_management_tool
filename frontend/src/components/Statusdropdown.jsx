import Select from 'react-select';

export default function StatusDropdown({ currentStatus, onStatusChange, disabled = false }) {
    
    const STATUS_OPTIONS = [
        {
            value: 'OPEN',
            label: 'AÇIK',
            bgColor: '#e3f2fd',
            textColor: '#1976d2'
        },
        {
            value: 'CLOSED',
            label: 'KAPANDI',
            bgColor: '#e8f5e9',
            textColor: '#388e3c'
        },
        {
            value: 'CONFIRMED',
            label: 'ONAYLANDI',
            bgColor: '#fff3e0',
            textColor: '#f57c00'
        },
        {
            value: 'PAUSED',
            label: 'DURDURULDU',
            bgColor: '#f3e5f5',
            textColor: '#7b1fa2'
        },
        {
            value: 'REOPENED',
            label: 'YENİDEN AÇILDI',
            bgColor: '#fce4ec',
            textColor: '#c2185b'
        },
        {
            value: 'CANCELLED',
            label: 'İPTAL EDİLDİ',
            bgColor: '#ffebee',
            textColor: '#d32f2f'
        }
    ];

    // Find current status option
    const currentOption = STATUS_OPTIONS.find(opt => opt.value === currentStatus);

    // Custom styles for react-select
    const customStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '45px',
            backgroundColor: currentOption?.bgColor || '#f5f5f5',
            borderColor: state.isFocused ? currentOption?.textColor : '#ddd',
            boxShadow: state.isFocused ? `0 0 0 1px ${currentOption?.textColor}` : 'none',
            '&:hover': {
                borderColor: currentOption?.textColor
            },
            cursor: 'pointer'
        }),
        singleValue: (base) => ({
            ...base,
            color: currentOption?.textColor || '#666',
            fontWeight: '600',
            fontSize: '0.95rem'
        }),
        option: (base, state) => {
            const option = STATUS_OPTIONS.find(opt => opt.value === state.data.value);
            return {
                ...base,
                backgroundColor: state.isSelected 
                    ? option?.bgColor 
                    : state.isFocused 
                        ? `${option?.bgColor}cc` 
                        : 'white',
                color: option?.textColor,
                fontWeight: state.isSelected ? '600' : '500',
                cursor: 'pointer',
                padding: '12px 16px',
                borderLeft: `4px solid ${option?.textColor}`,
                marginBottom: '2px',
                '&:hover': {
                    backgroundColor: option?.bgColor
                }
            };
        },
        menu: (base) => ({
            ...base,
            marginTop: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            overflow: 'hidden'
        }),
        menuList: (base) => ({
            ...base,
            padding: '8px'
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: currentOption?.textColor,
            '&:hover': {
                color: currentOption?.textColor
            }
        }),
        indicatorSeparator: () => ({
            display: 'none'
        })
    };

    return (
        <Select
            value={currentOption}
            options={STATUS_OPTIONS}
            onChange={(selected) => onStatusChange(selected.value)}
            styles={customStyles}
            isDisabled={disabled}
            isSearchable={false}
            placeholder="Durum Seçiniz..."
        />
    );
}