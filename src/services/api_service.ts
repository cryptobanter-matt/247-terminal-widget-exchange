import config from "../config/_index.ts";
import { use_widget_store } from "../store/widget_store.ts";
import type { WidgetConfigResponse } from "../types/widget.ts";
import type { TradeParams, TradeTokenResponse } from "../types/trade.ts";
import type { UserPreferences, UserPreferenceResponse } from "../types/widget.ts";

export const api_service = {
    fetch_widget_config: async (): Promise<WidgetConfigResponse['data'] | null> => {
        const { api_key } = use_widget_store.getState();

        try {
            const response = await fetch(`${config.api.base_url}/config`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(api_key && { 'X-API-Key': api_key }),
                }
            });
            if (!response.ok) throw new Error(`Config fetch failed: ${response.status}`);

            const result: WidgetConfigResponse = await response.json();
            if (!result.success) throw new Error('Config response unsuccessful');

            return result.data;
        } catch (error) {
            console.error('[api_service] fetch_widget_config error:', error);
            return null;
        }
    },

    generate_trade_token: async (trade_params: TradeParams): Promise<TradeTokenResponse['data'] | null> => {
        const { api_key, exchange_id, exchange_user_id } = use_widget_store.getState();

        if (!exchange_id || !exchange_user_id) {
            console.error('[api_service] Missing exchange_id or exchange_user_id');
            return null;
        }

        try {
            const response = await fetch(`${config.api.base_url}/generate-trade-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(api_key && { 'X-API-Key': api_key }),
                },
                body: JSON.stringify({
                    exchange_id,
                    exchange_user_id,
                    trade_params,
                }),
            });
            if (!response.ok) throw new Error(`Trade token request failed: ${response.status}`);

            const result: TradeTokenResponse = await response.json();
            if (!result.success) throw new Error(result.error || 'Trade token response unsuccessful');
            
            return result.data;
        } catch (error) {
            console.error('[api_service] generate_trade_token error:', error);
            return null;
        }
    },

    fetch_user_preferences: async (): Promise<UserPreferences | null > => {
        const { api_key, exchange_user_id } = use_widget_store.getState();
        if (!exchange_user_id) return null;

        try {
            const response = await fetch(
                `${config.api.base_url}/user-preferences?exchange_user_id=${encodeURIComponent(exchange_user_id)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(api_key && { 'X-API-Key': api_key }),
                    }
                }
            );

            if (!response.ok) throw new Error(`Preference fetch failed: ${response.status}`);

            const result: UserPreferenceResponse = await response.json();
            if (!result.success) throw new Error(`Preference response unsuccessful`);

            return result.data.user_preferences;
        } catch (error) {
            console.error('[api_service] fetch_user_preferences error:', error);
            return null;
        }
    },

    save_user_preferences: async (user_preferences: UserPreferences): Promise<boolean> => {
        const { api_key, exchange_user_id } = use_widget_store.getState();
        if (!exchange_user_id) return false;

        try {
            const response = await fetch(
                `${config.api.base_url}/user-preferences`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(api_key && { 'X-API-Key': api_key }),
                    },
                    body: JSON.stringify({ exchange_user_id, user_preferences })
                }
            );

            if (!response.ok) throw new Error(`Preferences save failed: ${response.status}`);

            const result: UserPreferenceResponse = await response.json();
            return result.success;
        } catch (error) {
            console.error('[api_service] save_user_preferences error:', error);
            return false;
        }
    } 
}