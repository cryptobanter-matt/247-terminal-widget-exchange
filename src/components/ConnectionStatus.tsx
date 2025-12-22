import styled from 'styled-components';
import { use_news_store } from '../store/news_store';

const Container = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    font-size: ${({ theme }) => theme.font_sizes.xs};
    color: ${({ theme }) => theme.colors.text_secondary};
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
`;

const Dot = styled.div<{ $is_connected: boolean }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ $is_connected, theme }) =>
        $is_connected ? theme.colors.success : theme.colors.danger};
`;

export function ConnectionStatus() {
    const is_connected = use_news_store((state) => state.is_connected);

    return (
        <Container>
            <Dot $is_connected={is_connected} />
            {is_connected ? 'Live' : 'Disconnected'}
        </Container>
    );
}