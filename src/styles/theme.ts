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
    },
    breakpoints: {
        narrow: 500,
        medium: 700,
        wide: 900,
    },
};

export const container_query = {
    narrow: `@container widget (max-width: ${theme.breakpoints.narrow}px)`,
    medium: `@container widget (min-width: ${theme.breakpoints.narrow + 1}px) and (max-width: ${theme.breakpoints.medium}px)`,
    wide: `@container widget (min-width: ${theme.breakpoints.medium + 1}px)`,
    min_medium: `@container widget (min-width: ${theme.breakpoints.narrow + 1}px)`,
    min_wide: `@container widget (min-width: ${theme.breakpoints.medium + 1}px)`,
};

export type AppTheme = typeof theme;
