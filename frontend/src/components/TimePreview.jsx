import { useState, useEffect } from 'react';
import { Clock, Globe, Eye } from 'lucide-react';


export default function TimePreview({ format, timezoneId }) {
    const [times, setTimes] = useState({
        local: '',
        utc: '',
        selected: '',
        error: null,
        utcDoy: '',

    });

    useEffect(() => {
        const updateTimes = () => {
            try {
                const now = new Date();

                // Local time (user's browser timezone)
                const localTime = formatDateTime(now, format, Intl.DateTimeFormat().resolvedOptions().timeZone);

                // UTC time
                const utcTime = formatDateTime(now, format, 'UTC');
                const utcDoy = getUtcDayOfYear(now);

                // Selected timezone time
                const selectedTime = formatDateTime(now, format, timezoneId);

                setTimes({
                    local: localTime,
                    utc: utcTime,
                    selected: selectedTime,
                    utcDoy: utcDoy,
                    error: null
                });
            } catch (error) {
                setTimes({
                    local: '',
                    utc: '',
                    selected: '',
                    utcDoy: '',
                    error: error.message
                });
            }
        };

        // Update immediately
        updateTimes();

        // Update every second
        const interval = setInterval(updateTimes, 1000);

        return () => clearInterval(interval);
    }, [format, timezoneId]);


    const getUtcDayOfYear = (date) => {
        const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1);          // Jan 1, UTC
        const currentDay = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        const diffMs = currentDay - startOfYear;
        return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // 1–366
    };
    const formatDateTime = (date, format, timezone) => {
        try {
            // Convert .NET format to Intl format options
            const options = parseFormatToOptions(format);

            // Format using Intl.DateTimeFormat
            const formatter = new Intl.DateTimeFormat('tr-TR', {
                ...options,
                timeZone: timezone
            });

            return formatter.format(date);
        } catch (error) {
            // Fallback: try to manually format
            return manualFormat(date, format, timezone);
        }
    };

    const getDayOfYear = (date) => {
        const start = new Date(date.getFullYear(), 0, 1);
        const diff = date - start;
        return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    };

    const parseFormatToOptions = (format) => {
        const options = {};

        // Year
        if (format.includes('yyyy')) {
            options.year = 'numeric';
        } else if (format.includes('yy')) {
            options.year = '2-digit';
        }

        // Month
        if (format.includes('MMMM')) {
            options.month = 'long';
        } else if (format.includes('MMM')) {
            options.month = 'short';
        } else if (format.includes('MM')) {
            options.month = '2-digit';
        } else if (format.includes('M')) {
            options.month = 'numeric';
        }

        // Day
        if (format.includes('dd')) {
            options.day = '2-digit';
        } else if (format.includes('d')) {
            options.day = 'numeric';
        }

        // Hour
        if (format.includes('HH')) {
            options.hour = '2-digit';
            options.hour12 = false;
        } else if (format.includes('hh')) {
            options.hour = '2-digit';
            options.hour12 = true;
        } else if (format.includes('H')) {
            options.hour = 'numeric';
            options.hour12 = false;
        } else if (format.includes('h')) {
            options.hour = 'numeric';
            options.hour12 = true;
        }

        // Minute
        if (format.includes('mm')) {
            options.minute = '2-digit';
        } else if (format.includes('m')) {
            options.minute = 'numeric';
        }

        // Second
        if (format.includes('ss')) {
            options.second = '2-digit';
        } else if (format.includes('s')) {
            options.second = 'numeric';
        }

        return options;
    };

    const manualFormat = (date, format, timezone) => {
        // Convert to target timezone
        const targetDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
        let result = format;

        // Year
        result = result.replace('yyyy', targetDate.getFullYear().toString());
        result = result.replace('yy', targetDate.getFullYear().toString().slice(-2));

        // Month
        const month = targetDate.getMonth() + 1;
        result = result.replace('MM', month.toString().padStart(2, '0'));
        result = result.replace('M', month.toString());

        // Day
        const day = targetDate.getDate();
        result = result.replace('dd', day.toString().padStart(2, '0'));
        result = result.replace('d', day.toString());

        // Hours
        const hours24 = targetDate.getHours();
        const hours12 = hours24 % 12 || 12;
        result = result.replace('HH', hours24.toString().padStart(2, '0'));
        result = result.replace('H', hours24.toString());
        result = result.replace('hh', hours12.toString().padStart(2, '0'));
        result = result.replace('h', hours12.toString());

        // Minutes
        const minutes = targetDate.getMinutes();
        result = result.replace('mm', minutes.toString().padStart(2, '0'));
        result = result.replace('m', minutes.toString());

        // Seconds
        const seconds = targetDate.getSeconds();
        result = result.replace('ss', seconds.toString().padStart(2, '0'));
        result = result.replace('s', seconds.toString());

        // AM/PM
        result = result.replace('tt', hours24 >= 12 ? 'PM' : 'AM');

        return result;
    };

    if (times.error) {
        return (
            <div style={styles.errorBox}>
                ❌ Geçersiz format: {times.error}
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.timeRow}>
                <div style={styles.label}>
                    <Clock size={14} style={{ marginRight: '6px' }} />
                    Yerel Zaman (Tarayıcı):
                </div>
                <div style={styles.value}>
                    {times.local}
                </div>
            </div>

            <div style={styles.timeRow}>
                <div style={styles.label}>
                    <Globe size={14} style={{ marginRight: '6px' }} />
                    UTC:
                </div>
                <div style={styles.value}>
                    {times.utc}
                </div>
            </div>
            <div style={styles.timeRow}>
                <div style={styles.label}>
                    <Globe size={14} style={{ marginRight: '6px' }} />
                    UTC - Yılın Günü (DOY):
                </div>
                <div style={styles.value}>
                    {times.utcDoy}
                </div>
            </div>

            <div style={styles.timeRow}>
                <div style={{ ...styles.label, ...styles.selectedLabel }}>
                    <Eye size={14} style={{ marginRight: '6px' }} />
                    Seçili Saat Dilimi:
                </div>
                <div style={{ ...styles.value, ...styles.selectedValue }}>
                    {times.selected}
                </div>
            </div>


        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    timeRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
    },
    label: {
        fontSize: '0.85rem',
        color: '#666',
        display: 'flex',
        alignItems: 'center',
        fontWeight: '500',
    },
    value: {
        fontSize: '1rem',
        fontFamily: 'monospace',
        color: '#333',
        fontWeight: '600',
    },
    selectedLabel: {
        color: '#667eea',
        fontWeight: '600',
    },
    selectedValue: {
        color: '#667eea',
        fontSize: '1.1rem',
    },
    errorBox: {
        padding: '1rem',
        backgroundColor: '#fee',
        color: '#c33',
        borderRadius: '4px',
        fontSize: '0.9rem',
    },
};