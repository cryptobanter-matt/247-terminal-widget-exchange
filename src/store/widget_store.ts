import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import config from '../config/_index.ts';
import type { ThemeConfig } from '../config/theme.ts';
import type { FeatureFlags, InitializationStatus, UserPreferences } from '../types/widget.ts';

const DEFAULT_USER_PREFERENCES: UserPreferences = {
    trade_amount_presets: config.trading.default_amounts,
    button_style: 'swipe',
    long_press_duration: 750,
};

interface WidgetState {
    api_key: string | null;
    exchange_id: string | null;
    exchange_user_id: string | null;
    theme: ThemeConfig | null;
    feature_flags: FeatureFlags | null;
    initialization_status: InitializationStatus;
    initialization_error: string | null;
    user_preferences: UserPreferences;
}

interface WidgetActions {
    initialize: (api_key: string, exchange_user_id: string | null) => void;
    set_exchange_id: (id: string) => void;
    set_theme: (theme: ThemeConfig) => void;
    set_feature_flags: (flags: FeatureFlags) => void;
    set_initialization_status: (status: InitializationStatus) => void;
    set_initialization_error: (error: string | null) => void;
    reset: () => void;
    set_user_preferences: (preferences: UserPreferences) => void;
    get_user_preferences: () => UserPreferences;
}

export const use_widget_store = create<WidgetState & WidgetActions>()(
    persist(
        (set, get) => ({
            api_key: null,
            exchange_id: null,
            exchange_user_id: null,
            theme: null,
            feature_flags: null,
            initialization_status: 'idle',
            initialization_error: null,
            user_preferences: DEFAULT_USER_PREFERENCES,

            initialize: (api_key, exchange_user_id) => set({
                api_key,
                exchange_user_id,
                initialization_status: 'loading',
                initialization_error: null,
            }),

            set_exchange_id: (id) => set({ exchange_id: id }),
            set_theme: (theme) => set({ theme }),
            set_feature_flags: (flags) => set({ feature_flags: flags }),
            set_initialization_status: (status) => set({ initialization_status: status }),
            set_initialization_error: (error) => set({ initialization_error: error }),

            reset: () => set({
                api_key: null,
                exchange_id: null,
                exchange_user_id: null,
                theme: null,
                feature_flags: null,
                initialization_status: 'idle',
                initialization_error: null,
            }),

            set_user_preferences: (preferences) => {
                const validated: UserPreferences = {
                    trade_amount_presets: preferences.trade_amount_presets
                        .filter(amount => amount >= 1 && Number.isFinite(amount))
                        .slice(0, 4),
                    button_style: preferences.button_style,
                    long_press_duration: preferences.long_press_duration,
                };

                if (validated.trade_amount_presets.length < 1) {
                    validated.trade_amount_presets = DEFAULT_USER_PREFERENCES.trade_amount_presets;
                }

                set({ user_preferences: validated });
            },

            get_user_preferences: () => get().user_preferences,
        }),
        {
            name: '247terminal-widget-storage',
            partialize: (state) => ({
                user_preferences: state.user_preferences,
            }),
        }
    )
);

export { DEFAULT_USER_PREFERENCES };
