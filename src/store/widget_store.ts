import { create } from 'zustand';

interface ThemeConfig {
    primary_color?: string;
    background_color?: string;
}

interface FeatureFlags {
    show_pnl?: boolean;
    allow_market_orders?: boolean;
}

interface WidgetState {
    api_key: string | null;
    exchange_id: string | null;
    exchange_user_id: string | null;
    theme_config: ThemeConfig;
    feature_flags: FeatureFlags;
    is_loading: boolean;
    error: string | null;

    initialize: (config: { api_key: string; exchange_user_id?: string }) => void;
    set_exchange_id: (exchange_id: string) => void;
    set_config: (config: { theme_config: ThemeConfig; feature_flags: FeatureFlags }) => void;
    set_loading: (is_loading: boolean) => void;
    set_error: (error: string | null) => void;
}

export const use_widget_store = create<WidgetState>((set) => ({
    api_key: null,
    exchange_id: null,
    exchange_user_id: null,
    theme_config: {},
    feature_flags: {},
    is_loading: false,
    error: null,

    initialize: (config) => set({
        api_key: config.api_key,
        exchange_user_id: config.exchange_user_id || null
    }),

    set_exchange_id: (exchange_id) => set({ exchange_id }),

    set_config: (config) => set({
        theme_config: config.theme_config,
        feature_flags: config.feature_flags,
    }),

    set_loading: (is_loading) => set({ is_loading }),
    set_error: (error) => set({ error }),
}));