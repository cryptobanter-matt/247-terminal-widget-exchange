export interface NewsItem {
    _id: string;
    title: string;
    body?: string;
    time: number;
    type?: string;
    source?: string;
    icon?: string;
    link?: string;
    image?: string;
    url?: string;
    info?: Record<string, unknown>;
    scraped_time?: number;
}

export interface SentimentData {
    type: 'ai_sentiment';
    news_id: string;
    news_time: number;
    sentiment: 'positive' | 'negative' | 'neutral';
}

export interface TradingVolumeAlert {
    type: 'trading_volume_alert';
    title: string;
    coin: string;
    [key: string]: unknown;
}

export type WebSocketMessage = NewsItem | SentimentData | TradingVolumeAlert;
