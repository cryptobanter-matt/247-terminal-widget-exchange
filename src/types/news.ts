export type NewsType = 'news' | 'twitter' | 'alert' | 'authorized';

export interface NewsItem {
    _id: string;
    title: string;
    body?: string;
    time: number;
    type?: NewsType;
    source?: string;
    source_handle?: string;        // @handle for Twitter sources
    icon?: string;
    link?: string;
    image?: string;
    url?: string;
    info?: {
        embedded_tweet?: EmbeddedTweet;
        [key: string]: unknown;
    };
    scraped_time?: number;
    sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface EmbeddedTweet {
    title: string;
    body: string;
    image?: string;
    url?: string;
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

export interface CoinConfig {
    symbol: string;
    price_change_percent?: number;
}

export interface TradingConfig {
    coins: CoinConfig[];
    amount_presets: number[];
}

export interface AuthorizedMessage {
    type: 'authorized';
    exchange_id: string;
}

export type WebSocketMessage = NewsItem | SentimentData | TradingVolumeAlert | AuthorizedMessage;