import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import config from '../config/_index.ts';
import type { ThemeConfig } from '../config/theme.ts';
import type { FeatureFlags, TradeAmountConfig, InitializationStatus} from '../types/widget.ts';

const MIN_PRESETS = config.trading.min_amount_options;
const MAX_PRESETS = config.trading.max_amount_options;
const MIN_AMOUNT = config.trading.min_trade_amount;

interface WidgetState {
    api_key: string | null;
    exchange_id: string | null;
    exchange_user_id: string | null;
    theme: ThemeConfig | null;
    feature_flags: FeatureFlags | null;
    initialization_status: InitializationStatus;
    initialization_error: string | null;
    trade_amounts: TradeAmountConfig;
}

interface WidgetActions {
    initialize: (api_key: string, exchange_user_id: string | null) => void;
    set_exchange_id: (id: string) => void;
    set_theme: (theme: ThemeConfig) => void;
    set_feature_flags: (flags: FeatureFlags) => void;
    set_initialization_status: (status: InitializationStatus) => void;
    set_initialization_error: (error: string | null) => void;
    reset: () => void;
    set_trade_amount_presets: (presets: number[]) => void;
    select_trade_amount: (index: number) => void;
    set_custom_amount: (amount: number | null) => void;
    add_trade_amount_preset: (amount: number) => void;
    remove_trade_amount_preset: (index: number) => void;
    get_current_trade_amount: () => number;
}

function validate_amount(amount: number): boolean {
    return amount >= MIN_AMOUNT && Number.isFinite(amount);
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
            trade_amounts: {
                presets: config.trading.default_amounts,
                selected_index: 0,
                custom_amount: null,
            },

            initialize: (api_key, exchange_user_id) => set ({
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

            set_trade_amount_presets: (presets) => {
                const valid_presets = presets
                    .filter(validate_amount)
                    .slice(0, MAX_PRESETS);

                if (valid_presets.length < MIN_PRESETS) {
                    console.warn(`[widget_store] At least ${MIN_PRESETS} trade amount preset required`);
                    return;
                }

                set((state) => ({
                    trade_amounts: {
                        ...state.trade_amounts,
                        presets: valid_presets,
                        selected_index: Math.min(state.trade_amounts.selected_index, valid_presets.length - 1),
                    },
                }));
            },

            select_trade_amount: (index) => {
                const { presets } = get().trade_amounts;
                if (index < 0 || index >= presets.length) return;

                set((state) => ({
                    trade_amounts: {
                        ...state.trade_amounts,
                        selected_index: index,
                        custom_amount: null,
                    },
                }));
            },

            set_custom_amount: (amount) => {
                if (amount !== null && !validate_amount(amount)) {
                    console.warn(`[widget_store] Invalid trade amount: ${amount}`);
                    return;
                }

                set((state) => ({
                    trade_amounts: {
                        ...state.trade_amounts,
                        custom_amount: amount,
                    },
                }));
            },

            add_trade_amount_preset: (amount) => {
                const { presets } = get().trade_amounts;

                if (presets.length >= MAX_PRESETS) {
                    console.warn(`[widget_store] Maximum ${MAX_PRESETS} presets allowed`);
                    return;
                }

                if (!validate_amount(amount)) {
                    console.warn(`[widget_store] Invalid amount: ${amount}`);
                    return;
                }

                if (presets.includes(amount)) {
                    console.warn(`[widget_store] Amount ${amount} already exists`);
                    return;
                }

                const new_presets = [...presets, amount].sort((a, b) => a - b);

                set((state) => ({
                    trade_amounts: {
                        ...state.trade_amounts,
                        presets: new_presets,
                    },
                }));
            },

            remove_trade_amount_preset: (index) => {
                const { presets } = get().trade_amounts;

                if (presets.length <= MIN_PRESETS) {
                    console.warn(`[widget_store] Minimum ${MIN_PRESETS} preset required`);
                    return;
                }

                const new_presets = presets.filter((_, i) => i !== index);

                set((state) => ({
                    trade_amounts: {
                        ...state.trade_amounts,
                        presets: new_presets,
                        selected_index: Math.min(state.trade_amounts.selected_index, new_presets.length - 1),
                    },
                }));
            },

            get_current_trade_amount: () => {
                const { presets, selected_index, custom_amount } = get().trade_amounts;
                return custom_amount ?? presets[selected_index];
            },
        }),
        {
            name: '247terminal-widget-storage',
            partialize: (state) => ({
                trade_amounts: state.trade_amounts,
            }),
        }
    )
)
