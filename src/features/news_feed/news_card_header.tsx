import styled, { keyframes } from 'styled-components';
import { NewsIcon, TwitterIcon, AlertIcon } from '../../components/icons';
import type { NewsType } from '../../types/news';
import { container_query } from '../../styles/theme';

const alert_shake = keyframes`
    0%, 100% { transform: rotate(0deg); }
    10% { transform: rotate(-12deg); }
    20% { transform: rotate(10deg); }
    30% { transform: rotate(-8deg); }
    40% { transform: rotate(6deg); }
    50% { transform: rotate(-4deg); }
    60% { transform: rotate(2deg); }
    70% { transform: rotate(0deg); }
`;

interface NewsCardHeaderProps {
    type?: NewsType;
    title: string;
    source_handle?: string;
    time: number;
    url?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
}

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.sm};

    ${container_query.min_wide} {
        gap: ${({ theme }) => theme.spacing.md};
        margin-bottom: ${({ theme }) => theme.spacing.md};
    }
`;

const TypeIconWrapper = styled.div<{ is_alert?: boolean }>`
    flex-shrink: 0;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ is_alert, theme }) => is_alert ? '#f59e0b' : theme.colors.text_secondary};
    animation: ${({ is_alert }) => is_alert ? alert_shake : 'none'} 1.2s ease-out;
    animation-delay: 0.3s;

    ${container_query.min_wide} {
        width: 24px;
    }
`;

const TitleLink = styled.a<{ is_alert?: boolean }>`
    flex: 1;
    min-width: 0;
    font-weight: 600;
    font-size: ${({ theme }) => theme.font_sizes.medium};
    color: ${({ is_alert, theme }) => is_alert ? '#f59e0b' : theme.colors.text_primary};
    text-decoration: none;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;

    &:hover {
        color: ${({ is_alert, theme }) => is_alert ? '#f59e0b' : theme.colors.primary};
    }

    ${container_query.min_wide} {
        font-size: ${({ theme }) => theme.font_sizes.large};
    }
`;

const RightSection = styled.div`
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
`;

const SentimentLabel = styled.span<{ sentiment: string }>`
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-align: right;
    color: ${({ sentiment, theme }) =>
        sentiment === 'positive' ? theme.colors.success :
        sentiment === 'negative' ? theme.colors.danger :
        theme.colors.text_secondary};
`;

const Timestamp = styled.span`
    font-size: 10px;
    color: ${({ theme }) => theme.colors.text_secondary};
    opacity: 0.7;

    ${container_query.min_wide} {
        font-size: 11px;
    }
`;

function TypeIcon({ type }: { type?: NewsType }) {
    switch (type) {
        case 'twitter':
            return <TwitterIcon size={16} />;
        case 'alert':
            return <AlertIcon size={16} />;
        case 'news':
        default:
            return <NewsIcon size={16} />;
    }
}

function get_sentiment_text(sentiment: 'positive' | 'negative' | 'neutral'): string {
    switch (sentiment) {
        case 'positive':
            return 'GOOD';
        case 'negative':
            return 'BAD';
        case 'neutral':
        default:
            return 'NEUTRAL';
    }
}

export function NewsCardHeader({
    type,
    title,
    source_handle,
    time,
    url,
    sentiment
}: NewsCardHeaderProps) {
    const format_relative_time = (timestamp: number): string => {
        const now = Date.now();
        const diff = Math.floor((now - timestamp) / 1000 / 60);
        if (diff < 1) return 'now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    const display_title = type === 'twitter' && source_handle
        ? `@${source_handle}`
        : title;

    const handle_click = (e: MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <Header>
            <TypeIconWrapper is_alert={type === 'alert'}>
                <TypeIcon type={type} />
            </TypeIconWrapper>

            <TitleLink
                is_alert={type === 'alert'}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handle_click}
            >
                {display_title}
            </TitleLink>

            <RightSection>
                {sentiment && (
                    <SentimentLabel sentiment={sentiment}>
                        {get_sentiment_text(sentiment)}
                    </SentimentLabel>
                )}
                <Timestamp>{format_relative_time(time)}</Timestamp>
            </RightSection>
        </Header>
    );
}