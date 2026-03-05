import { createContext, useContext, useState, useEffect } from 'react';

export const PRESET_THEMES = {
    ocean: {
        name: 'Ocean Blue',
        primary: '#0f172a',
        accent: '#3b82f6',
        accentText: '#ffffff',
        bg: '#e0f0ff',
        surface: '#ffffff',
        gradient: 'linear-gradient(135deg, #e0f0ff 0%, #c7dfff 50%, #dbeafe 100%)',
    },
    midnight: {
        name: 'Midnight',
        primary: '#0f0f23',
        accent: '#8b5cf6',
        accentText: '#ffffff',
        bg: '#0f0f23',
        surface: '#1a1a3e',
        gradient: 'linear-gradient(135deg, #0f0f23 0%, #1a1030 50%, #0d1b2a 100%)',
    },
    sunset: {
        name: 'Sunset',
        primary: '#1f0a00',
        accent: '#f97316',
        accentText: '#ffffff',
        bg: '#fff7ed',
        surface: '#ffffff',
        gradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fef3c7 100%)',
    },
    forest: {
        name: 'Forest',
        primary: '#052e16',
        accent: '#16a34a',
        accentText: '#ffffff',
        bg: '#f0fdf4',
        surface: '#ffffff',
        gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #d1fae5 100%)',
    },
    rose: {
        name: 'Rose Gold',
        primary: '#1c0010',
        accent: '#e11d48',
        accentText: '#ffffff',
        bg: '#fff1f2',
        surface: '#ffffff',
        gradient: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fce7f3 100%)',
    },
    slate: {
        name: 'Slate',
        primary: '#020617',
        accent: '#64748b',
        accentText: '#ffffff',
        bg: '#f8fafc',
        surface: '#ffffff',
        gradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    },
};

export const FONT_OPTIONS = [
    { id: 'inter', label: 'Inter', css: "'Inter', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' },
    { id: 'outfit', label: 'Outfit', css: "'Outfit', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap' },
    { id: 'poppins', label: 'Poppins', css: "'Poppins', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap' },
    { id: 'sora', label: 'Sora', css: "'Sora', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap' },
    { id: 'space-grotesk', label: 'Space Grotesk', css: "'Space Grotesk', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap' },
];

export const RADIUS_OPTIONS = [
    { id: 'sharp', label: 'Sharp', value: '0px' },
    { id: 'soft', label: 'Soft', value: '12px' },
    { id: 'round', label: 'Round', value: '24px' },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children, initialTheme = 'ocean', initialFont = 'inter', initialRadius = 'round', customAccent = null }) {
    const [themeKey, setThemeKey] = useState(initialTheme);
    const [customTheme, setCustomTheme] = useState(null);
    const [fontId, setFontId] = useState(initialFont);
    const [radiusId, setRadiusId] = useState(initialRadius);
    const [showPanel, setShowPanel] = useState(false);
    const [animationsEnabled, setAnimationsEnabled] = useState(true);

    const activeTheme = customTheme || PRESET_THEMES[themeKey] || PRESET_THEMES.ocean;
    const activeFont = FONT_OPTIONS.find(f => f.id === fontId) || FONT_OPTIONS[0];
    const activeRadius = RADIUS_OPTIONS.find(r => r.id === radiusId) || RADIUS_OPTIONS[2];
    const isDark = themeKey === 'midnight';

    useEffect(() => {
        // Inject Google Font
        const linkId = `widget-font-${fontId}`;
        if (!document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = activeFont.url;
            document.head.appendChild(link);
        }
    }, [fontId]);

    const getCSSVars = () => ({
        '--w-primary': customAccent || activeTheme.accent,
        '--w-accent': customAccent || activeTheme.accent,
        '--w-accent-text': activeTheme.accentText,
        '--w-bg': activeTheme.bg,
        '--w-surface': activeTheme.surface,
        '--w-text': isDark ? '#f8fafc' : '#0f172a',
        '--w-text-muted': isDark ? '#94a3b8' : '#64748b',
        '--w-border': isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
        '--w-card-bg': isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
        '--w-card-hover': isDark ? 'rgba(255,255,255,0.08)' : '#f8fafc',
        '--w-input-bg': isDark ? 'rgba(255,255,255,0.07)' : '#f8fafc',
        '--w-gradient': activeTheme.gradient,
        '--w-font': activeFont.css,
        '--w-radius': activeRadius.value,
        '--w-radius-sm': `calc(${activeRadius.value} * 0.5)`,
        '--w-radius-lg': `calc(${activeRadius.value} * 1.5)`,
        '--w-shadow': isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)',
        '--w-shadow-accent': `0 8px 32px ${(customAccent || activeTheme.accent)}33`,
        '--w-glass': isDark ? 'rgba(15,15,35,0.7)' : 'rgba(255,255,255,0.7)',
        '--w-transition': animationsEnabled ? '0.3s cubic-bezier(0.16, 1, 0.3, 1)' : '0s',
    });

    return (
        <ThemeContext.Provider value={{
            themeKey, setThemeKey,
            customTheme, setCustomTheme,
            fontId, setFontId,
            radiusId, setRadiusId,
            showPanel, setShowPanel,
            animationsEnabled, setAnimationsEnabled,
            activeTheme, activeFont, activeRadius, isDark,
            getCSSVars,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
}
