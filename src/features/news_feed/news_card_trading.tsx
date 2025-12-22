import { useState, useEffect, useRef } from 'preact/hooks';
import styled from 'styled-components';
import { SwipeTradeButton } from '../../components/SwipeTradeButton';
import { StandardTradeButtons } from '../../components/StandardTradeButtons';
import type { TradingConfig } from '../../types/news';
import type { ButtonStyle, LongPressDuration } from '../../types/widget';
import app_config from '../../config/_index';

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
    const wrapper_ref = useRef<HTMLDivElement>(null);
    const [is_narrow, set_is_narrow] = useState(false);

    useEffect(() => {
        const element = wrapper_ref.current;
        if (!element) return;

        const check_width = (width: number) => {
            if (width > 0) {
                set_is_narrow(width < app_config.theme.defaults.breakpoints.narrow);
            }
        };

        check_width(element.offsetWidth);

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                check_width(entry.contentRect.width);
            }
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const effective_style = is_narrow ? 'swipe' : button_style;

    return (
        <Wrapper ref={wrapper_ref}>
            {effective_style === 'standard' ? (
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