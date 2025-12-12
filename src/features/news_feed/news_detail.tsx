import styled from 'styled-components';
import type { NewsItem, SentimentData } from '../../types/news';
import { SentimentIndicator } from './sentiment_indicator';

interface NewsDetailProps {
    news_item: NewsItem;
    sentiment?: SentimentData;
    on_back: () => void;
    on_trade?: () => void;
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: ${({ theme }) => theme.spacing.md};
`;

const BackButton = styled.button`
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    padding: 0;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.font_sizes.medium};

    &:hover {
        text-decoration: underline;
    }
`;

const Title = styled.h2`
    margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
    font-size: ${({ theme }) => theme.font_sizes.large};
`;

const Meta = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.font_sizes.small};
    color: ${({ theme }) => theme.colors.text_secondary};
`;

const Body = styled.div`
    flex: 1;
    overflow-y: auto;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text_primary};
`;

const Actions = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-top: ${({ theme }) => theme.spacing.md};
    padding-top: ${({ theme }) => theme.spacing.md};
    border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const TradeButton = styled.button`
    flex: 1;
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text_primary};
    border: none;
    border-radius: ${({ theme }) => theme.radii.md};
    font-size: ${({ theme }) => theme.font_sizes.medium};
    font-weight: 600;
    cursor: pointer;

    &:hover {
        opacity: 0.9;
    }
`;

const LinkButton = styled.a`
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    background: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: 1px solid ${({ theme }) => theme.colors.primary};
    border-radius: ${({ theme }) => theme.radii.md};
    font-size: ${({ theme }) => theme.font_sizes.medium};
    text-decoration: none;
    text-align: center;

    &:hover {
        background: ${({ theme }) => theme.colors.primary}10;
    }
`;

export function NewsDetail({ news_item, sentiment, on_back, on_trade }: NewsDetailProps) {
    const format_datetime = (timestamp: number): string => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <Container>
            <BackButton onClick={on_back}>← Back to feed</BackButton>
            <Title>{news_item.title}</Title>
            <Meta>
                {news_item.source && <span>{news_item.source}</span>}
                <span>{format_datetime(news_item.time)}</span>
                {sentiment && <SentimentIndicator sentiment={sentiment.sentiment} />}
            </Meta>
            <Body>
                {news_item.body || 'No additional content available.'}
            </Body>
            <Actions>
                {on_trade && (
                    <TradeButton onClick={on_trade}>
                        Trade on this news
                    </TradeButton>
                )}
                {news_item.url && (
                    <LinkButton href={news_item.url} target="_blank" rel="noopener noreferrer">
                        Read source
                    </LinkButton>
                )}
            </Actions>
        </Container>
    );
}