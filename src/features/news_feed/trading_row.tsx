import styled from 'styled-components';
import { AmountButton } from './amount_button';
import type { CoinConfig } from '../../types/news';

interface TradingRowProps {
    coin: CoinConfig;
    amount_presets: number[];
    on_trade: (coin: string, amount: number, side: 'long' | 'short') => void;
}

const Row = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => theme.spacing.xs} 0;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing.xs};
`;

const CoinInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
`;

const CoinSymbol = styled.span`
    font-weight: 600;
    font-size: ${({ theme }) => theme.font_sizes.medium};
    color: ${({ theme }) => theme.colors.text_primary};
`;

const PriceChange = styled.span<{ is_positive: boolean }>`
    font-size: ${({ theme }) => theme.font_sizes.small};
    color: ${({ theme, is_positive }) =>
        is_positive ? theme.colors.success : theme.colors.danger
    };
`;

export function TradingRow({ coin, amount_presets, on_trade }: TradingRowProps) {
    const handle_trade = (amount: number, side: 'long' | 'short') => {
        on_trade(coin.symbol, amount, side);
    };

    const is_positive = (coin.price_change_percent ?? 0) >= 0;
    const formatted_change = coin.price_change_percent !== undefined
        ? `${is_positive ? '+' : ''}${coin.price_change_percent.toFixed(2)}%`
        : null;

    const long_amounts = [...amount_presets].sort((a, b) => a - b);
    const short_amounts = [...amount_presets].sort((a, b) => b - a);

    return (
        <Row>
            <ButtonGroup>
                {long_amounts.map(amount => (
                    <AmountButton
                        key={`long-${amount}`}
                        amount={amount}
                        side="long"
                        on_click={handle_trade}
                    />
                ))}
            </ButtonGroup>

            <CoinInfo>
                <CoinSymbol>{coin.symbol}</CoinSymbol>
                {formatted_change && (
                    <PriceChange is_positive={is_positive}>
                        {formatted_change}
                    </PriceChange>
                )}
            </CoinInfo>

            <ButtonGroup>
                {short_amounts.map(amount => (
                    <AmountButton
                        key={`short-${amount}`}
                        amount={amount}
                        side="short"
                        on_click={handle_trade}
                    />
                ))}
            </ButtonGroup>
        </Row>
    );
}