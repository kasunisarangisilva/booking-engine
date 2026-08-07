import { useTheme } from './ThemeContext';

const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 800,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'var(--w-text-muted)', marginBottom: 8,
};

export default function StepDetails({ formData, updateFormData }) {
    const { isDark } = useTheme();

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
            alignItems: 'center',
            width: '100%',
        }}>
            {/* Left — headline */}
            <div>
                <div className="w-badge" style={{ marginBottom: 20 }}>Step 2 of 5</div>
                <h1 style={{
                    fontSize: 'clamp(32px, 4.5vw, 60px)',
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: 'var(--w-text)',
                    lineHeight: 1.05,
                    marginBottom: 16,
                }}>
                    Your <span style={{ color: 'var(--w-accent)' }}>details</span>
                </h1>
                <p style={{
                    fontSize: 'clamp(14px, 1.5vw, 18px)',
                    color: 'var(--w-text-muted)',
                    fontWeight: 500,
                    lineHeight: 1.7,
                    maxWidth: 360,
                }}>
                    Tell us about yourself and where you&apos;re booking from. We&apos;ll use this to confirm your booking.
                </p>

                {/* Feature callouts */}
                <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                        { icon: '🔒', title: 'Secure & Private', sub: 'Your data is never shared' },
                        { icon: '📧', title: 'Instant Confirmation', sub: 'Email sent within seconds' },
                        { icon: '✏️', title: 'Edit Anytime', sub: 'Change your booking easily' },
                    ].map(f => (
                        <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <span style={{
                                width: 36, height: 36,
                                borderRadius: 'var(--w-radius-sm)',
                                background: 'var(--w-input-bg)',
                                border: '1px solid var(--w-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 16, flexShrink: 0,
                            }}>{f.icon}</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--w-text)' }}>{f.title}</div>
                                <div style={{ fontWeight: 500, fontSize: 12, color: 'var(--w-text-muted)' }}>{f.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right — form card */}
            <div className="w-glass-card" style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 22, width: '100%', maxWidth: 480, margin: '0 auto', textAlign: 'left' }}>

                {/* Full Name */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={labelStyle}>Full Name *</label>
                        <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--w-text-muted)' }}>
                            {(formData.name || '').length}/60
                        </span>
                    </div>
                    <input
                        type="text"
                        maxLength={60}
                        placeholder="e.g. John Doe"
                        className="w-input"
                        value={formData.name || ''}
                        onChange={(e) => updateFormData({ name: e.target.value })}
                        required
                    />
                </div>

                {/* Email */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={labelStyle}>Email Address *</label>
                        <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--w-text-muted)' }}>
                            {(formData.email || '').length}/100
                        </span>
                    </div>
                    <input
                        type="email"
                        maxLength={100}
                        placeholder="e.g. john@example.com"
                        className="w-input"
                        value={formData.email || ''}
                        onChange={(e) => updateFormData({ email: e.target.value })}
                        required
                    />
                </div>

                {/* Phone */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={labelStyle}>Phone Number *</label>
                        <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--w-text-muted)' }}>
                            {(formData.phone || '').length}/20
                        </span>
                    </div>
                    <input
                        type="tel"
                        maxLength={20}
                        placeholder="e.g. +94771234567"
                        className="w-input"
                        value={formData.phone || ''}
                        onChange={(e) => updateFormData({ phone: e.target.value })}
                        required
                    />
                </div>

                {/* Location */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={labelStyle}>📍 Your Location</label>
                        <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--w-text-muted)' }}>
                            {(formData.location || '').length}/100
                        </span>
                    </div>
                    <input
                        type="text"
                        maxLength={100}
                        placeholder="e.g. Colombo, Sri Lanka"
                        className="w-input"
                        value={formData.location || ''}
                        onChange={(e) => updateFormData({ location: e.target.value })}
                    />
                    <p style={{ marginTop: 6, fontSize: 11, color: 'var(--w-text-muted)', fontWeight: 500 }}>
                        City or country you&apos;re travelling from
                    </p>
                </div>

                {/* Special Requirements */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={labelStyle}>✨ Special Requirements</label>
                        <span style={{ fontSize: 10, fontFamily: 'monospace', color: (formData.specialRequirements || '').length >= 450 ? 'var(--w-accent)' : 'var(--w-text-muted)' }}>
                            {(formData.specialRequirements || '').length}/500
                        </span>
                    </div>
                    <textarea
                        placeholder="e.g. Early check-in, vegetarian meal, wheelchair access..."
                        className="w-input"
                        rows={3}
                        maxLength={500}
                        value={formData.specialRequirements || ''}
                        onChange={(e) => updateFormData({ specialRequirements: e.target.value })}
                        style={{
                            resize: 'vertical',
                            minHeight: 80,
                            lineHeight: 1.6,
                            fontFamily: 'inherit',
                        }}
                    />
                    <p style={{ marginTop: 6, fontSize: 11, color: 'var(--w-text-muted)', fontWeight: 500 }}>
                        Optional — any preferences or needs for your booking
                    </p>
                </div>

            </div>
        </div>
    );
}
