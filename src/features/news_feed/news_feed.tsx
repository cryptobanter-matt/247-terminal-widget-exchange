import { useEffect } from 'preact/hooks';
import styled from 'styled-components';
import { use_news_store } from '../../store/news_store';
import { websocket_service } from '../../services/websocket_service';
import { use_widget_store } from '../../store/widget_store';
import { NewsCard } from './news_card';
import { NewsDetail } from './news_detail';
import type { NewsItem } from '../../types/news';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h2`
    margin: 0;
    font-size: ${({ theme }) => theme.font_sizes.large};
`;

const ConnectionStatus = styled.span<{ is_connected: boolean }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ is_connected, theme }) =>
        is_connected ? theme.colors.success : theme.colors.danger};
`;

const NewsList = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: ${({ theme }) => theme.spacing.md};
`;

const EmptyState = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: ${({ theme }) => theme.colors.text_secondary};
`;

interface NewsFeedProps {
    on_trade_from_news?: (news_item: NewsItem) => void;
}

export function NewsFeed({ on_trade_from_news }: NewsFeedProps) {
    const { api_key } = use_widget_store();
    const {
        news_items,
        sentiment_map,
        is_connected,
        selected_news_id,
        set_selected_news
    } = use_news_store();

    useEffect(() => {
        if (api_key) {
            websocket_service.connect({ api_key });
        }

        return () => {
            websocket_service.disconnect();
        };
    }, [api_key]);

    const selected_news = selected_news_id
        ? news_items.find(n => n._id === selected_news_id)
        : null;

    if (selected_news) {
        return (
            <NewsDetail
                news_item={selected_news}
                sentiment={sentiment_map.get(selected_news._id)}
                on_back={() => set_selected_news(null)}
                on_trade={() => on_trade_from_news?.(selected_news)}
            />
        );
    }

    return (
        <Container>
            <Header>
                <Title>News Feed</Title>
                <ConnectionStatus is_connected={is_connected} />
            </Header>
            <NewsList>
                {news_items.length === 0 ? (
                    <EmptyState>
                        {is_connected ? 'Waiting for news...' : 'Connecting...'}
                    </EmptyState>
                ) : (
                    news_items.map(item => (
                        <NewsCard
                            key={item._id}
                            news_item={item}
                            sentiment={sentiment_map.get(item._id)}
                            on_click={set_selected_news}
                        />
                    ))
                )}
            </NewsList>
        </Container>
    );
}