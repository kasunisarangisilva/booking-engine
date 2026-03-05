import { useState } from 'react';
import { useTheme, PRESET_THEMES, FONT_OPTIONS, RADIUS_OPTIONS } from './ThemeContext';

export default function ThemeSettingsPanel() {
    const {
        themeKey, setThemeKey,
        setCustomTheme,
        fontId, setFontId,
        radiusId, setRadiusId,
        showPanel, setShowPanel,
        animationsEnabled, setAnimationsEnabled,
        isDark,
    } = useTheme();

    const [customAccent, setCustomAccent] = useState('');

    const applyCustomAccent = (color) => {
        setCustomAccent(color);
        setCustomTheme(prev => ({
            ...(PRESET_THEMES[themeKey] || PRESET_THEMES.ocean),
            accent: color,
        }));
    };

    return (
        <>
            {/* Backdrop */}
            {showPanel && (
                <div
                    className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-sm"
                    onClick={() => setShowPanel(false)}
                />
            )}

            {/* Panel */}
            <div
                style={{
                    fontFamily: 'var(--w-font)',
                    position: 'fixed',
                    top: 0,
                    right: showPanel ? '0' : '-400px',
                    width: '360px',
                    height: '100%',
                    background: 'var(--w-surface)',
                    borderLeft: '1px solid var(--w-border)',
                    boxShadow: 'var(--w-shadow)',
                    zIndex: 100,
                    transition: 'right 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--w-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    background: 'var(--w-surface)',
                    zIndex: 10,
                }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--w-text)', margin: 0 }}>
                            🎨 Theme Settings
                        </h2>
                        <p style={{ fontSize: 12, color: 'var(--w-text-muted)', margin: '2px 0 0', fontWeight: 500 }}>
                            Customize your booking widget
                        </p>
                    </div>
                    <button
                        onClick={() => setShowPanel(false)}
                        style={{
                            width: 36, height: 36, borderRadius: '50%',
                            border: '1px solid var(--w-border)',
                            background: 'var(--w-input-bg)',
                            cursor: 'pointer',
                            fontSize: 18,
                            color: 'var(--w-text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

                    {/* Preset Themes */}
                    <section>
                        <label style={sectionLabel(isDark)}>Color Themes</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {Object.entries(PRESET_THEMES).map(([key, t]) => (
                                <button
                                    key={key}
                                    onClick={() => { setThemeKey(key); setCustomTheme(null); setCustomAccent(''); }}
                                    style={{
                                        padding: '10px 14px',
                                        borderRadius: 'var(--w-radius-sm)',
                                        border: themeKey === key ? '2px solid var(--w-accent)' : '2px solid var(--w-border)',
                                        background: t.bg,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        transition: 'all 0.2s',
                                        boxShadow: themeKey === key ? '0 0 0 4px var(--w-shadow-accent)' : 'none',
                                    }}
                                >
                                    <span style={{
                                        width: 20, height: 20, borderRadius: '50%',
                                        background: t.accent, flexShrink: 0,
                                        boxShadow: `0 2px 6px ${t.accent}55`,
                                    }} />
                                    <span style={{ fontSize: 12, fontWeight: 700, color: t.primary }}>{t.name}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Custom Accent */}
                    <section>
                        <label style={sectionLabel(isDark)}>Custom Accent Color</label>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <input
                                type="color"
                                value={customAccent || PRESET_THEMES[themeKey]?.accent || '#3b82f6'}
                                onChange={(e) => applyCustomAccent(e.target.value)}
                                style={{
                                    width: 52, height: 52, border: 'none', borderRadius: 'var(--w-radius-sm)',
                                    cursor: 'pointer', padding: 2,
                                    background: 'var(--w-input-bg)',
                                    boxShadow: 'var(--w-shadow)',
                                }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: 14, fontWeight: 700, color: 'var(--w-text)',
                                    marginBottom: 2,
                                }}>
                                    {customAccent || PRESET_THEMES[themeKey]?.accent || '#3b82f6'}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--w-text-muted)', fontWeight: 500 }}>
                                    Buttons, highlights & selections
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Font Selection */}
                    <section>
                        <label style={sectionLabel(isDark)}>Typography</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {FONT_OPTIONS.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFontId(f.id)}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: 'var(--w-radius-sm)',
                                        border: fontId === f.id ? '2px solid var(--w-accent)' : '2px solid var(--w-border)',
                                        background: fontId === f.id ? 'color-mix(in srgb, var(--w-accent) 8%, transparent)' : 'var(--w-input-bg)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <span style={{
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color: fontId === f.id ? 'var(--w-accent)' : 'var(--w-text)',
                                        fontFamily: f.css,
                                    }}>
                                        {f.label}
                                    </span>
                                    {fontId === f.id && (
                                        <span style={{
                                            width: 18, height: 18, borderRadius: '50%',
                                            background: 'var(--w-accent)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 10, color: 'white',
                                        }}>✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Border Radius */}
                    <section>
                        <label style={sectionLabel(isDark)}>Corner Style</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {RADIUS_OPTIONS.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => setRadiusId(r.id)}
                                    style={{
                                        flex: 1,
                                        padding: '12px 10px',
                                        borderRadius: r.value,
                                        border: radiusId === r.id ? '2px solid var(--w-accent)' : '2px solid var(--w-border)',
                                        background: radiusId === r.id ? 'color-mix(in srgb, var(--w-accent) 10%, transparent)' : 'var(--w-input-bg)',
                                        cursor: 'pointer',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: radiusId === r.id ? 'var(--w-accent)' : 'var(--w-text-muted)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Animations Toggle */}
                    <section>
                        <label style={sectionLabel(isDark)}>Animations</label>
                        <button
                            onClick={() => setAnimationsEnabled(prev => !prev)}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: 'var(--w-radius-sm)',
                                border: '2px solid var(--w-border)',
                                background: 'var(--w-input-bg)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--w-text)' }}>
                                Step Transitions
                            </span>
                            <div style={{
                                width: 46, height: 26,
                                background: animationsEnabled ? 'var(--w-accent)' : 'var(--w-border)',
                                borderRadius: 999,
                                position: 'relative',
                                transition: 'background 0.2s',
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: 3, left: animationsEnabled ? 23 : 3,
                                    width: 20, height: 20,
                                    borderRadius: '50%',
                                    background: 'white',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                                    transition: 'left 0.2s',
                                }} />
                            </div>
                        </button>
                    </section>

                    {/* Embed Attributes preview */}
                    <section>
                        <label style={sectionLabel(isDark)}>Embed Code</label>
                        <div style={{
                            background: '#0f172a',
                            borderRadius: 'var(--w-radius-sm)',
                            padding: '14px 16px',
                            fontSize: 11,
                            fontFamily: 'monospace',
                            color: '#94a3b8',
                            lineHeight: 1.7,
                            wordBreak: 'break-all',
                        }}>
                            <span style={{ color: '#64748b' }}>&lt;booking-engine</span>
                            <br />
                            {'  '}<span style={{ color: '#7dd3fc' }}>data-theme</span>
                            <span style={{ color: '#64748b' }}>="</span>
                            <span style={{ color: '#86efac' }}>{themeKey}</span>
                            <span style={{ color: '#64748b' }}>"</span>
                            <br />
                            {'  '}<span style={{ color: '#7dd3fc' }}>data-font</span>
                            <span style={{ color: '#64748b' }}>="</span>
                            <span style={{ color: '#86efac' }}>{fontId}</span>
                            <span style={{ color: '#64748b' }}>"</span>
                            <br />
                            {'  '}<span style={{ color: '#7dd3fc' }}>data-radius</span>
                            <span style={{ color: '#64748b' }}>="</span>
                            <span style={{ color: '#86efac' }}>{radiusId}</span>
                            <span style={{ color: '#64748b' }}>"</span>
                            <span style={{ color: '#64748b' }}>&gt;&lt;/booking-engine&gt;</span>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

function sectionLabel(isDark) {
    return {
        display: 'block',
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: isDark ? '#64748b' : '#94a3b8',
        marginBottom: 12,
    };
}
