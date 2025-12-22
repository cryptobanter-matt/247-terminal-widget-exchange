import styled from 'styled-components';

interface SentimentIndicatorProps {
    sentiment: 'positive' | 'negative' | 'neutral';
}

const Indicator = styled.span<{ $sentiment: 'positive' | 'negative' | 'neutral' }>`
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    padding: 2px 6px;
    border-radius: 4px;
    color: ${({ $sentiment }) =>
        $sentiment === 'positive' ? '#22c55e' :
        $sentiment === 'negative' ? '#ef4444' :
        '#a1a1aa'
    };
    background: ${({ $sentiment }) =>
        $sentiment === 'positive' ? 'rgba(34, 197, 94, 0.15)' :
        $sentiment === 'negative' ? 'rgba(239, 68, 68, 0.15)' :
        'rgba(161, 161, 170, 0.15)'
    };
`;

export function SentimentIndicator({ sentiment }: SentimentIndicatorProps) {
    return <Indicator $sentiment={sentiment}>{sentiment.toUpperCase()}</Indicator>;
}
