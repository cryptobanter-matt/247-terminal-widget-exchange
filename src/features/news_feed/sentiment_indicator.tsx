import styled from 'styled-components';

interface SentimentIndicatorProps {
    sentiment: 'positive' | 'negative' | 'neutral';
}

const sentiment_emoji_map: Record<string, string> = {
    positive: '😊',
    neutral: '😐',
    negative: '😟'
};

const Indicator = styled.span<{ sentiment: string }>`
    font-size: 18px;
    filter: ${({ sentiment }) =>
        sentiment === 'neutral' ? 'grayscale(100%)' : 'none'
    };
`;

export function SentimentIndicator({ sentiment }: SentimentIndicatorProps) {
    return <Indicator sentiment={sentiment}>{sentiment_emoji_map[sentiment]}</Indicator>;
}