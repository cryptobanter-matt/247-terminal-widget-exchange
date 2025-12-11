export const theme = {
    colors: {
        background: '#121212',
        surface: '#1E1E1E',
        primary: '#3A86FF',
        secondary: '#FF006E',
        text_primary: '#FFFFFF',
        text_secondary: '#BDBDBD',
        success: '#00C49A',
        danger: '#FF6B6B',
        border: '#333333',
    },
    fonts: {
        body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    },
    font_sizes: {
        small: '12px',
        medium: '14px',
        large: '16px',
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
    },
    radii: {
        sm: '4px',
        md: '8px',
    },
    shadows: {
        main: '0 4px 12px rgba(0, 0, 0, 0.1)',
    }
};

export type AppTheme = typeof theme;
