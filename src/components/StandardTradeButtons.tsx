import { useState, useRef, useCallback, useEffect } from 'preact/hooks';
import styled, { keyframes } from 'styled-components';

interface CoinConfig {
    symbol: string;
    price_change_percent: number;
}

interface StandardTradeButtonsProps {
    coins: CoinConfig[];
    amount_presets?: number[];
    long_press_duration?: 0 | 500 | 750 | 1000;
    on_trade: (coin: string, amount: number, side: 'long' | 'short') => void;
}

const DEFAULT_AMOUNT_PRESETS = [100, 250, 500];

const pulse_long = keyframes`
    0% {
        box-shadow: inset 0 0 0 0 rgba(0, 196, 154, 0);
    }
    50% {
        box-shadow: inset 0 0 0 2px rgba(0, 196, 154, 0.9), 0 0 12px rgba(0, 196, 154, 0.5);
    }
    100% {
        box-shadow: inset 0 0 0 0 rgba(0, 196, 154, 0);
    }
`;

const pulse_short = keyframes`
    0% {
        box-shadow: inset 0 0 0 0 rgba(255, 107, 107, 0);
    }
    50% {
        box-shadow: inset 0 0 0 2px rgba(255, 107, 107, 0.9), 0 0 12px rgba(255, 107, 107, 0.5);
    }
    100% {
        box-shadow: inset 0 0 0 0 rgba(255, 107, 107, 0);
    }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
`;

const CoinRow = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
`;

const ButtonGroupWide = styled.div`
    display: flex;
    gap: 6px;
    flex: 1;
`;

const ButtonGroupStacked = styled.div<{ count: number }>`
    display: grid;
    grid-template-columns: ${({ count }) => count <= 2 ? `repeat(${count}, 1fr)` : '1fr 1fr'};
    gap: 6px;
    flex: 1;
`;

const CoinInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    padding: 0 4px;
`;

const CoinSymbol = styled.span`
    font-size: 14px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text_primary};
    line-height: 1.2;
    user-select: none;
    -webkit-user-select: none;
`;

const PriceChange = styled.span<{ is_positive: boolean }>`
    font-size: 10px;
    font-weight: 600;
    color: ${({ is_positive, theme }) =>
        is_positive ? theme.colors.success : theme.colors.danger};
    line-height: 1.2;
    user-select: none;
    -webkit-user-select: none;
`;

const ButtonWrapperWide = styled.div`
    flex: 1;
    position: relative;
    min-width: 44px;
`;

const ButtonWrapperStacked = styled.div<{ stacked_order: number; grid_column?: number }>`
    position: relative;
    min-width: 44px;
    order: ${({ stacked_order }) => stacked_order};
    grid-column: ${({ grid_column }) => grid_column || 'auto'};
`;

const TradeButton = styled.button<{
    side: 'long' | 'short';
    is_pressing: boolean;
    progress: number;
    pulse_active: boolean;
}>`
    width: 100%;
    position: relative;
    height: 36px;
    border: none;
    border-radius: ${({ theme }) => theme.radii.sm};
    background: ${({ side }) =>
        side === 'long' ? '#00996b' : '#cc4a4a'};
    cursor: pointer;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    transition: filter 0.1s ease, opacity 0.15s ease;
    opacity: ${({ is_pressing }) => is_pressing ? 1 : 0.8};
    filter: brightness(${({ is_pressing, progress }) =>
        is_pressing ? 1 + progress * 0.2 : 1});
    animation: ${({ pulse_active, side }) =>
        pulse_active
            ? side === 'long' ? pulse_long : pulse_short
            : 'none'} 0.4s ease-out;

    &:active {
        outline: none;
    }

    &:focus {
        outline: none;
    }
`;

const AmountLabel = styled.span`
    position: relative;
    z-index: 1;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    user-select: none;
    -webkit-user-select: none;
`;

const ProgressWrapper = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 3;
`;

interface ButtonProgressRingProps {
    progress: number;
    side: 'long' | 'short';
}

function ButtonProgressRing({ progress, side }: ButtonProgressRingProps) {
    const wrapper_ref = useRef<HTMLDivElement>(null);
    const [dims, set_dims] = useState<{ w: number; h: number } | null>(null);

    useEffect(() => {
        const el = wrapper_ref.current;
        if (!el) return;

        const update_dims = () => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                set_dims(prev => {
                    if (prev && prev.w === rect.width && prev.h === rect.height) {
                        return prev;
                    }
                    return { w: rect.width, h: rect.height };
                });
            }
        };

        update_dims();

        const observer = new ResizeObserver(update_dims);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    if (!dims) {
        return <ProgressWrapper ref={wrapper_ref} />;
    }

    if (progress === 0) {
        return <ProgressWrapper ref={wrapper_ref} />;
    }

    const { w, h } = dims;
    const stroke = 3;
    const offset = 3;
    const r = 7;
    const svg_w = w + offset * 2;
    const svg_h = h + offset * 2;

    const path = `
        M ${svg_w / 2} 1.5
        L ${svg_w - r - 1.5} 1.5
        Q ${svg_w - 1.5} 1.5 ${svg_w - 1.5} ${r + 1.5}
        L ${svg_w - 1.5} ${svg_h - r - 1.5}
        Q ${svg_w - 1.5} ${svg_h - 1.5} ${svg_w - r - 1.5} ${svg_h - 1.5}
        L ${r + 1.5} ${svg_h - 1.5}
        Q 1.5 ${svg_h - 1.5} 1.5 ${svg_h - r - 1.5}
        L 1.5 ${r + 1.5}
        Q 1.5 1.5 ${r + 1.5} 1.5
        Z
    `;

    const perimeter = 2 * (svg_w - 3) + 2 * (svg_h - 3) - 8 * r + 2 * Math.PI * r;
    const dash_offset = perimeter * (1 - progress);
    const color = side === 'long' ? '#00ffaa' : '#ff6b6b';

    return (
        <ProgressWrapper ref={wrapper_ref}>
            <svg
                width={svg_w}
                height={svg_h}
                viewBox={`0 0 ${svg_w} ${svg_h}`}
                style={{ position: 'absolute', top: -offset, left: -offset, overflow: 'visible' }}
            >
                <path
                    d={path}
                    fill="none"
                    stroke="rgba(0, 0, 0, 0.4)"
                    strokeWidth={stroke}
                />
                <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={perimeter}
                    strokeDashoffset={dash_offset}
                    style={{
                        filter: `drop-shadow(0 0 3px ${color}) drop-shadow(0 0 8px ${color})`,
                    }}
                />
            </svg>
        </ProgressWrapper>
    );
}

interface ButtonState {
    is_pressing: boolean;
    progress: number;
    pulse_active: boolean;
    pulse_key: number;
}

type ButtonKey = `${string}-${'long' | 'short'}-${number}`;
type LayoutType = 'wide' | 'stacked';

const STACKED_THRESHOLD = 780;

export function StandardTradeButtons({
    coins,
    amount_presets = DEFAULT_AMOUNT_PRESETS,
    long_press_duration = 500,
    on_trade,
}: StandardTradeButtonsProps) {
    const [button_states, set_button_states] = useState<Record<ButtonKey, ButtonState>>({});
    const [layout, set_layout] = useState<LayoutType>('stacked');
    const timers_ref = useRef<Record<ButtonKey, ReturnType<typeof setInterval> | null>>({});
    const container_ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = container_ref.current;
        if (!element) return;

        const check_width = () => {
            const width = element.getBoundingClientRect().width;
            if (width > 0) {
                set_layout(width > STACKED_THRESHOLD ? 'wide' : 'stacked');
            }
        };

        check_width();

        const observer = new ResizeObserver(() => check_width());
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const get_button_state = (key: ButtonKey): ButtonState => {
        return button_states[key] || {
            is_pressing: false,
            progress: 0,
            pulse_active: false,
            pulse_key: 0,
        };
    };

    const update_button_state = useCallback((key: ButtonKey, updates: Partial<ButtonState>) => {
        set_button_states(prev => ({
            ...prev,
            [key]: { ...(prev[key] || { is_pressing: false, progress: 0, pulse_active: false, pulse_key: 0 }), ...updates },
        }));
    }, []);

    const clear_timer = useCallback((key: ButtonKey) => {
        if (timers_ref.current[key]) {
            clearInterval(timers_ref.current[key]!);
            timers_ref.current[key] = null;
        }
    }, []);

    const handle_pointer_down = useCallback((
        e: PointerEvent,
        coin: string,
        side: 'long' | 'short',
        amount: number,
        index: number
    ) => {
        const key: ButtonKey = `${coin}-${side}-${index}`;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);

        if (long_press_duration === 0) {
            update_button_state(key, {
                pulse_active: true,
                pulse_key: Date.now(),
            });
            setTimeout(() => update_button_state(key, { pulse_active: false }), 400);
            on_trade(coin, amount, side);
            return;
        }

        update_button_state(key, {
            is_pressing: true,
            progress: 0,
        });

        const start_time = Date.now();
        timers_ref.current[key] = setInterval(() => {
            const elapsed = Date.now() - start_time;
            const new_progress = Math.min(elapsed / long_press_duration, 1);

            if (new_progress >= 1) {
                clear_timer(key);
                update_button_state(key, {
                    is_pressing: false,
                    progress: 0,
                    pulse_active: true,
                    pulse_key: Date.now(),
                });
                setTimeout(() => update_button_state(key, { pulse_active: false }), 400);
                on_trade(coin, amount, side);
            } else {
                update_button_state(key, { progress: new_progress });
            }
        }, 16);
    }, [long_press_duration, on_trade, clear_timer, update_button_state]);

    const handle_pointer_up = useCallback((
        e: PointerEvent,
        coin: string,
        side: 'long' | 'short',
        index: number
    ) => {
        const key: ButtonKey = `${coin}-${side}-${index}`;
        clear_timer(key);
        update_button_state(key, {
            is_pressing: false,
            progress: 0,
        });
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }, [clear_timer, update_button_state]);

    const sorted_amounts_asc = [...amount_presets].sort((a, b) => a - b);
    const sorted_amounts_desc = [...amount_presets].sort((a, b) => b - a);
    const count = amount_presets.length;

    const get_stacked_order = (index: number, side: 'long' | 'short', total: number): number => {
        if (total <= 2) return index;

        if (total === 3) {
            if (side === 'long') {
                // [100, 500, 1000] -> [500, 1000, _, 100]
                // index 0 (lowest) -> order 3 (bottom right, under first)
                // index 1 (middle) -> order 0 (top left)
                // index 2 (highest) -> order 1 (top right)
                const order_map = [3, 0, 1];
                return order_map[index];
            } else {
                // [1000, 500, 100] -> [1000, 500, 100, _]
                // index 0 (highest) -> order 0 (top left)
                // index 1 (middle) -> order 1 (top right)
                // index 2 (lowest) -> order 2 (bottom left, under first)
                const order_map = [0, 1, 2];
                return order_map[index];
            }
        }

        // 4+ buttons
        const half = Math.ceil(total / 2);
        if (side === 'long') {
            return index < half ? index + half : index - half;
        }
        return index;
    };

    const render_button_content = (
        coin: string,
        side: 'long' | 'short',
        amount: number,
        index: number
    ) => {
        const key: ButtonKey = `${coin}-${side}-${index}`;
        const state = get_button_state(key);

        return (
            <>
                <TradeButton
                    side={side}
                    is_pressing={state.is_pressing}
                    progress={state.progress}
                    pulse_active={state.pulse_active}
                    onPointerDown={(e) => handle_pointer_down(e as PointerEvent, coin, side, amount, index)}
                    onPointerUp={(e) => handle_pointer_up(e as PointerEvent, coin, side, index)}
                    onPointerCancel={(e) => handle_pointer_up(e as PointerEvent, coin, side, index)}
                    onPointerLeave={(e) => handle_pointer_up(e as PointerEvent, coin, side, index)}
                >
                    <AmountLabel>${amount}</AmountLabel>
                </TradeButton>
                {long_press_duration > 0 && (
                    <ButtonProgressRing progress={state.progress} side={side} />
                )}
            </>
        );
    };

    const render_wide_buttons = (coin: string, amounts: number[], side: 'long' | 'short') => (
        <ButtonGroupWide>
            {amounts.map((amount, index) => {
                const key: ButtonKey = `${coin}-${side}-${index}`;
                const state = get_button_state(key);
                return (
                    <ButtonWrapperWide key={`${key}-${state.pulse_key}`}>
                        {render_button_content(coin, side, amount, index)}
                    </ButtonWrapperWide>
                );
            })}
        </ButtonGroupWide>
    );

    const get_grid_column = (index: number, side: 'long' | 'short', total: number): number | undefined => {
        if (total === 3 && side === 'long' && index === 0) {
            return 2;
        }
        return undefined;
    };

    const render_stacked_buttons = (coin: string, amounts: number[], side: 'long' | 'short') => (
        <ButtonGroupStacked count={count}>
            {amounts.map((amount, index) => {
                const key: ButtonKey = `${coin}-${side}-${index}`;
                const state = get_button_state(key);
                const stacked_order = get_stacked_order(index, side, count);
                const grid_column = get_grid_column(index, side, count);
                return (
                    <ButtonWrapperStacked
                        key={`${key}-${state.pulse_key}`}
                        stacked_order={stacked_order}
                        grid_column={grid_column}
                    >
                        {render_button_content(coin, side, amount, index)}
                    </ButtonWrapperStacked>
                );
            })}
        </ButtonGroupStacked>
    );

    return (
        <Container ref={container_ref}>
            {coins.map((coin) => (
                <CoinRow key={coin.symbol}>
                    {layout === 'wide'
                        ? render_wide_buttons(coin.symbol, sorted_amounts_asc, 'long')
                        : render_stacked_buttons(coin.symbol, sorted_amounts_asc, 'long')
                    }

                    <CoinInfo>
                        <CoinSymbol>{coin.symbol}</CoinSymbol>
                        <PriceChange is_positive={coin.price_change_percent >= 0}>
                            {coin.price_change_percent >= 0 ? '+' : ''}{coin.price_change_percent.toFixed(2)}%
                        </PriceChange>
                    </CoinInfo>

                    {layout === 'wide'
                        ? render_wide_buttons(coin.symbol, sorted_amounts_desc, 'short')
                        : render_stacked_buttons(coin.symbol, sorted_amounts_desc, 'short')
                    }
                </CoinRow>
            ))}
        </Container>
    );
}
