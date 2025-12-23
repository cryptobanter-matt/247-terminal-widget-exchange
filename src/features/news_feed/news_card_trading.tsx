import styled from 'styled-components';
import { SwipeTradeButton } from '../../components/SwipeTradeButton';
import { StandardTradeButtons } from '../../components/StandardTradeButtons';
import type { TradingConfig } from '../../types/news';
import type { ButtonStyle, LongPressDuration } from '../../types/widget';

interface NewsCardTradingProps {
    config: TradingConfig;
    button_style?: ButtonStyle;
    long_press_duration?: LongPressDuration;
    on_trade: (coin: string, amount: number, side: 'long' | 'short') => void;
}

const Wrapper = styled.div`
    width: 100%;
`;

const SwipeContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
`;

export function NewsCardTrading({ config, button_style = 'swipe', long_press_duration = 750, on_trade }: NewsCardTradingProps) {
    return (
        <Wrapper>
            {button_style === 'standard' ? (
                <StandardTradeButtons
                    coins={config.coins}
                    amount_presets={config.preset_amounts}
                    long_press_duration={long_press_duration}
                    on_trade={on_trade}
                />
            ) : (
                <SwipeContainer>
                    {config.coins.map(coin => (
                        <SwipeTradeButton
                            key={coin.symbol}
                            coin={coin.symbol}
                            amount_presets={config.preset_amounts}
                            long_press_duration={long_press_duration}
                            on_trade={(c, amount, side) => on_trade(c, amount, side)}
                        />
                    ))}
                </SwipeContainer>
            )}
        </Wrapper>
    );
}