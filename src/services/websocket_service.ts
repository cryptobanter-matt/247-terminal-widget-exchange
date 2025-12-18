import config from "../config/_index.ts";
import type { NewsItem, SentimentData, TradingVolumeAlert, WebSocketMessage } from "../types/news.ts";

interface WebSocketServiceConfig {
    api_key: string;
    on_news: (news: NewsItem) => void;
    on_sentiment: (sentiment: SentimentData) => void;
    on_volume_alert: (alert: TradingVolumeAlert) => void;
    on_connection_change: (connected: boolean) => void;
    on_error: (error: string) => void;
}

class WebSocketService {
    private socket: WebSocket | null = null;
    private service_config: WebSocketServiceConfig | null = null;
    private reconnect_attempts = 0;
    private ping_interval_id: number | null = null;
    private is_authenticated = false;

    connect(service_config: WebSocketServiceConfig): void {
        this.service_config = service_config;
        this.establish_connection();
    }

    disconnect(): void {
        this.stop_ping_interval();
        if (this.socket) {
            this.socket.close(1000, 'Client disconnect');
            this.socket = null;
        }
        this.is_authenticated = false;
        this.reconnect_attempts = 0;
    }

    is_connected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN && this.is_authenticated;
    }

    private establish_connection(): void {
        if (!this.service_config) return;

        this.socket = new WebSocket(config.websocket.url);

        this.socket.onopen = () => {
            this.send_auth_message();
        };

        this.socket.onmessage = (event) => {
            this.handle_message(event.data);
        };

        this.socket.onclose = (event) => {
            this.handle_close(event);
        };

        this.socket.onerror = () => {
            this.service_config?.on_error('WebSocket connection error');
        };
    }

    private send_auth_message(): void {
        if (!this.socket || !this.service_config) return;

        const auth_message = {
            type: 'auth',
            api_key: this.service_config.api_key,
        };

        this.socket.send(JSON.stringify(auth_message));
    }

    private handle_message(data: string): void {
        if (!this.service_config) return;
        if (data === 'pong') return;

        try {
            const message = JSON.parse(data) as WebSocketMessage;

            switch (message.type) {
                case 'auth_success': 
                    this.is_authenticated = true;
                    this.reconnect_attempts = 0;
                    this.start_ping_interval();
                    this.service_config.on_connection_change(true);
                    break;
                
                case 'auth_error':
                    this.service_config.on_error(`Authentication failed: ${message.error}`);
                    this.service_config.on_connection_change(false);
                    break;

                case 'news':
                    this.service_config.on_news(message.data);
                    break;

                case 'ai_sentiment':
                    this.service_config.on_sentiment({
                        news_id: message.news_id,
                        sentiment: message.sentiment as 'positive' | 'negative' | 'neutral',
                    });
                    break;

                case 'trading_volume_alert':
                    this.service_config.on_volume_alert(message as TradingVolumeAlert);
                    break;

                case 'pong':
                    break;
            } 
        } catch {

        }
    }

    private handle_close(event: CloseEvent): void {
        this.is_authenticated = false;
        this.stop_ping_interval();
        this.service_config?.on_connection_change(false);
        
        const no_reconnect_codes = [1000, 4001, 40002, 4003];
        if (no_reconnect_codes.includes(event.code)) return;

        this.schedule_reconnect()
    }

    private schedule_reconnect(): void {
        const { max_attempts, base_delay, max_delay } = config.websocket.reconnect;

        if (this.reconnect_attempts >= max_attempts) {
            this.service_config?.on_error('Max reconnection attempts reached');
            return;
        }

        const delay = Math.min(base_delay * Math.pow(2, this.reconnect_attempts), max_delay);
        this.reconnect_attempts++;

        setTimeout(() => {
            this.establish_connection()
        }, delay);
    }

    private start_ping_interval(): void {
        this.ping_interval_id = window.setInterval(() => {
            if (this.socket?.readyState === WebSocket.OPEN) this.socket.send('ping');
        }, config.websocket.ping_interval)
    }

    private stop_ping_interval(): void {
        if (this.ping_interval_id) {
            clearInterval(this.ping_interval_id);
            this.ping_interval_id = null;
        }
    }
}

export const websocket_service = new WebSocketService();