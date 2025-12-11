import { use_widget_store } from '../store/widget_store';

const API_BASE_URL = 'https://your-backend.com/api/app/widget';

interface TradeParams {
    pair: string;
    amount: number;
    side: 'buy' | 'sell';
}

export const api_service = {
    fetch_widget_config: async () => {
        const { exchange_id, set_config, set_error } = use_widget_store.getState();
        try {
            const response = await fetch(`${API_BASE_URL}/config?id=${exchange_id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch widget configuration.');
            }
            const config = await response.json();
            set_config(config);
        } catch (err: any) {
            set_error(err.message);
        }
    },

    generate_trade_token: async (trade_params: TradeParams): Promise<string | null> => {
        const { exchange_id, exchange_user_id, set_error } = use_widget_store.getState();
        try {
            const response = await fetch(`${API_BASE_URL}/generate-trade-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exchange_id,
                    exchange_user_id,
                    trade_params,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate trade token.');
            }

            const { token } = await response.json();
            return token;
        } catch (err: any) {
            set_error(err.message);
            return null;
        }
    },
};