import { useState } from 'preact/hooks';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { NewsCardHeader } from './news_card_header';
import { NewsCardBody } from './news_card_body';
import { NewsCardTrading } from './news_card_trading';
import type { NewsItem, TradingConfig, NewsType } from '../../types/news';
import type { ButtonStyle, LongPressDuration } from '../../types/widget';
import { container_query } from '../../styles/theme';

interface NewsCardProps {
    news_item: NewsItem;
    sentiment?: 'positive' | 'negative' | 'neutral';
    on_click?: (id: string) => void;
    trading_config?: TradingConfig;
    button_style?: ButtonStyle;
    long_press_duration?: LongPressDuration;
    on_trade?: (coin: string, amount: number, side: 'long' | 'short', news_id: string) => void;
}

const pulse_long = keyframes`
    0% { border-color: transparent; box-shadow: 0 0 0 rgba(0, 196, 154, 0); }
    50% { border-color: rgba(0, 196, 154, 0.9); box-shadow: 0 0 20px rgba(0, 196, 154, 0.5); }
    100% { border-color: transparent; box-shadow: 0 0 0 rgba(0, 196, 154, 0); }
`;

const pulse_short = keyframes`
    0% { border-color: transparent; box-shadow: 0 0 0 rgba(255, 107, 107, 0); }
    50% { border-color: rgba(255, 107, 107, 0.9); box-shadow: 0 0 20px rgba(255, 107, 107, 0.5); }
    100% { border-color: transparent; box-shadow: 0 0 0 rgba(255, 107, 107, 0); }
`;

const Card = styled(motion.div)<{ is_unread_alert?: boolean; pulse_side?: 'long' | 'short' | null }>`
    background: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.radii.md};
    padding: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    border: 1px solid ${({ is_unread_alert }) => is_unread_alert ? '#d97706' : 'transparent'};
    user-select: none;
    -webkit-user-select: none;
    transition: border-color 0.3s ease;
    animation: ${({ pulse_side }) =>
        pulse_side === 'long' ? pulse_long :
        pulse_side === 'short' ? pulse_short :
        'none'} 0.5s ease-out;

    ${container_query.min_wide} {
        padding: ${({ theme }) => theme.spacing.lg};
        margin-bottom: ${({ theme }) => theme.spacing.md};
    }
`;

const BodyWrapper = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing.sm};

    ${container_query.min_wide} {
        margin-bottom: ${({ theme }) => theme.spacing.md};
    }
`;

export function NewsCard({
    news_item,
    sentiment,
    trading_config,
    button_style = 'swipe',
    long_press_duration = 750,
    on_trade
}: NewsCardProps) {
    const [is_seen, set_is_seen] = useState(false);
    const [pulse_side, set_pulse_side] = useState<'long' | 'short' | null>(null);
    const is_alert = news_item.type === 'alert';

    const handle_trade = (coin: string, amount: number, side: 'long' | 'short') => {
        set_pulse_side(null);
        setTimeout(() => set_pulse_side(side), 10);
        setTimeout(() => set_pulse_side(null), 510);
        on_trade?.(coin, amount, side, news_item._id || '');
    };

    const handle_interaction = () => {
        if (is_alert && !is_seen) {
            set_is_seen(true);
        }
    };

    const has_body_content = !!(news_item.body || news_item.image || news_item.info?.embedded_tweet);

    return (
        <Card
            is_unread_alert={is_alert && !is_seen}
            pulse_side={pulse_side}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={handle_interaction}
            onTouchStart={handle_interaction}
        >
            <NewsCardHeader
                type={news_item.type as NewsType}
                title={news_item.title}
                time={news_item.time}
                url={news_item.link}
                sentiment={sentiment}
            />

            {has_body_content && (
                <BodyWrapper>
                    <NewsCardBody
                        body={news_item.body}
                        image={news_item.image}
                        embedded_tweet={news_item.info?.embedded_tweet}
                    />
                </BodyWrapper>
            )}

            {trading_config && (
                <NewsCardTrading
                    config={trading_config}
                    button_style={button_style}
                    long_press_duration={long_press_duration}
                    on_trade={handle_trade}
                />
            )}
        </Card>
    );
}