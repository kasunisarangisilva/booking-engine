import { useTheme } from './ThemeContext';

const OPTIONS = [
    { id: 'hotel', label: 'Hotel', icon: '🏨', desc: 'Rooms, suites & accommodations' },
    { id: 'hostel', label: 'Hostel', icon: '🏠', desc: 'Budget-friendly shared spaces' },
    { id: 'cinema', label: 'Cinema', icon: '🎬', desc: 'Movie tickets & screenings' },
    { id: 'vehicle', label: 'Vehicle', icon: '🚗', desc: 'Cars, bikes & rentals' },
    { id: 'space', label: 'Space', icon: '🏢', desc: 'Event venues & co-working spaces' },
];

export default function StepTypeSelection({ formData, updateFormData }) {
    const { isDark } = useTheme();

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
            alignItems: 'center',
            width: '100%',
        }}>
            {/* Left side — headline */}
            <div style={{ textAlign: 'left' }}>
                <div className="w-badge" style={{ marginBottom: 20 }}>
                    Step 1 of 5
                </div>
                <h1 style={{
                    fontSize: 'clamp(34px, 4.5vw, 64px)',
                    fontWeight: 900,
                    color: 'var(--w-text)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.04em',
                    marginBottom: 16,
                }}>
                    What type of<br />
                    <span style={{ color: 'var(--w-accent)' }}>booking?</span>
                </h1>
                <p style={{
                    fontSize: 'clamp(15px, 1.5vw, 19px)',
                    color: 'var(--w-text-muted)',
                    fontWeight: 500,
                    lineHeight: 1.7,
                    maxWidth: 360,
                }}>
                    Choose your business category to find the perfect listings for your needs.
                </p>

                {/* Decorative blobs */}
                <div style={{
                    marginTop: 48,
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap',
                }}>
                    {OPTIONS.map(o => (
                        <span
                            key={o.id}
                            style={{
                                display: 'inline-block',
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                padding: '5px 12px',
                                borderRadius: 999,
                                background: formData.businessType === o.id
                                    ? 'var(--w-accent)'
                                    : 'var(--w-input-bg)',
                                color: formData.businessType === o.id
                                    ? 'var(--w-accent-text)'
                                    : 'var(--w-text-muted)',
                                border: '1px solid var(--w-border)',
                                transition: 'all var(--w-transition)',
                                cursor: 'pointer',
                            }}
                            onClick={() => updateFormData({ businessType: o.id })}
                        >
                            {o.icon} {o.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Right side — option cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {OPTIONS.map(opt => {
                    const isSelected = formData.businessType === opt.id;
                    return (
                        <div
                            key={opt.id}
                            className={`w-option-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => updateFormData({ businessType: opt.id })}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div className="w-icon-circle" style={{ fontSize: 22 }}>
                                    {opt.icon}
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: 16, fontWeight: 800,
                                        color: isSelected ? 'var(--w-accent)' : 'var(--w-text)',
                                        marginBottom: 2,
                                    }}>
                                        {opt.label}
                                    </div>
                                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--w-text-muted)' }}>
                                        {opt.desc}
                                    </div>
                                </div>
                            </div>
                            <div className="w-radio-dot" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
