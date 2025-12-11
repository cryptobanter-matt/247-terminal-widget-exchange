import { create } from 'zustand';
import type { NewsItem, SentimentData, TradingVolumeAlert } from '../types/news';

interface NewsState {
    news_items: NewsItem[];
    sentiment_map: Map<string, SentimentData>;
    volume_alerts: TradingVolumeAlert[];
    selected_news_id: string | null;
    is_connected: boolean;
    connection_error: string | null;
    max_news_items: number;

    add_news_item: (item: NewsItem) => void;
    add_sentiment: (sentiment: SentimentData) => void;
    add_volume_alert: (alert: TradingVolumeAlert) => void;
    set_selected_news: (news_id: string | null) => void;
    set_connection_status: (is_connected: boolean, error?: string | null) => void;
    clear_news: () => void;
}

export const use_news_store = create<NewsState>((set, get) => ({
    news_items: [],
    sentiment_map: new Map(),
    volume_alerts: [],
    selected_news_id: null,
    is_connected: false,
    connection_error: null,
    max_news_items: 100,

    add_news_item: (item) => set((state) => {
        const exists = state.news_items.some(n => n._id === item._id);
        if (exists) return state;

        const updated_items = [item, ...state.news_items]
            .slice(0, state.max_news_items);

        return { news_items: updated_items };
    }),

    add_sentiment: (sentiment) => set((state) => {
        const new_map = new Map(state.sentiment_map);
        new_map.set(sentiment.news_id, sentiment);
        return { sentiment_map: new_map };
    }),

    add_volume_alert: (alert) => set((state) => ({
        volume_alerts: [alert, ...state.volume_alerts].slice(0, 20)
    })),

    set_selected_news: (news_id) => set({ selected_news_id: news_id }),

    set_connection_status: (is_connected, error = null) => set({
        is_connected,
        connection_error: error
    }),

    clear_news: () => set({
        news_items: [],
        sentiment_map: new Map(),
        volume_alerts: []
    })
}));