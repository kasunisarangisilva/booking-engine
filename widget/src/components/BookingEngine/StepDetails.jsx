import { useTheme } from './ThemeContext';

const FIELDS = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g. John Doe', icon: '👤' },
    { key: 'email', label: 'Email Address', type: 'email', placeholder: 'e.g. john@example.com', icon: '✉️' },
    { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'e.g. +94771234567', icon: '📱' },
];

export default function StepDetails({ formData, updateFormData }) {
    const { isDark } = useTheme();

    const handleChange = (key, val) => updateFormData({ [key]: val });

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
                    We'll use your information to confirm your booking and send you updates.
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

            <div className="w-glass-card" style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: 480, margin: '0 auto', textAlign: 'left' }}>
                <div>
                    <label style={{
                        display: 'block', fontSize: 11, fontWeight: 800,
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: 'var(--w-text-muted)', marginBottom: 8,
                    }}>
                        Full Name
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. John Doe"
                        className="w-input"
                        value={formData.name || ''}
                        onChange={(e) => updateFormData({ name: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label style={{
                        display: 'block', fontSize: 11, fontWeight: 800,
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: 'var(--w-text-muted)', marginBottom: 8,
                    }}>
                        Email Address
                    </label>
                    <input
                        type="email"
                        placeholder="e.g. john@example.com"
                        className="w-input"
                        value={formData.email || ''}
                        onChange={(e) => updateFormData({ email: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label style={{
                        display: 'block', fontSize: 11, fontWeight: 800,
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: 'var(--w-text-muted)', marginBottom: 8,
                    }}>
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        placeholder="e.g. +94771234567"
                        className="w-input"
                        value={formData.phone || ''}
                        onChange={(e) => updateFormData({ phone: e.target.value })}
                        required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                    <div className="space-y-3">
                        <label className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest px-1">Property Standard</label>
                        <select
                            className="w-input"
                            value={formData.propertyType}
                            onChange={e => updateFormData({ propertyType: e.target.value })}
                            style={{ cursor: 'pointer', appearance: 'none', background: 'var(--w-input-bg)' }}
                        >
                            <option value="">Any</option>
                            <option value="luxury">💎 Luxury</option>
                            <option value="budget">💰 Budget</option>
                            <option value="boutique">✨ Boutique</option>
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block', fontSize: 11, fontWeight: 800,
                            letterSpacing: '0.12em', textTransform: 'uppercase',
                            color: 'var(--w-text-muted)', marginBottom: 8,
                        }}>
                            Quantity
                        </label>
                        <input
                            className="w-input"
                            type="number"
                            min="1"
                            placeholder="1"
                            value={formData.rooms || ''}
                            onChange={e => updateFormData({ rooms: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label style={{
                        display: 'block', fontSize: 11, fontWeight: 800,
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: 'var(--w-text-muted)', marginBottom: 8,
                    }}>
                        Country
                    </label>
                    <div style={{ position: 'relative' }}>
                        <span style={{
                            position: 'absolute', left: 16, top: '50%',
                            transform: 'translateY(-50%)', fontSize: 16,
                        }}>🌍</span>
                        <input
                            className="w-input"
                            type="text"
                            placeholder="e.g. Singapore"
                            value={formData.country || ''}
                            onChange={e => updateFormData({ country: e.target.value })}
                            style={{ paddingLeft: 48 }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
