import { useState, useRef, useCallback } from 'preact/hooks';
import styled, { keyframes } from 'styled-components';

interface SwipeTradeButtonProps {
    coin: string;
    price_change_percent?: number;
    amount_presets?: number[];
    initial_amount_index?: number;
    long_press_duration?: number;
    on_trade: (coin: string, amount: number, side: 'long' | 'short') => void;
}

const DEFAULT_AMOUNT_PRESETS = [100, 200, 300, 600];

const pulse_glow = keyframes`
    0% {
        text-shadow: 0 0 0 rgba(255, 255, 255, 0);
        transform: scale(1);
    }
    50% {
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.8), 0 0 16px rgba(255, 255, 255, 0.4);
        transform: scale(1.15);
    }
    100% {
        text-shadow: 0 0 0 rgba(255, 255, 255, 0);
        transform: scale(1);
    }
`;

const trade_pulse_long = keyframes`
    0% {
        box-shadow: inset 0 0 0 0 rgba(0, 196, 154, 0);
    }
    50% {
        box-shadow: inset 0 0 0 3px rgba(0, 196, 154, 0.8), 0 0 20px rgba(0, 196, 154, 0.5);
    }
    100% {
        box-shadow: inset 0 0 0 0 rgba(0, 196, 154, 0);
    }
`;

const trade_pulse_short = keyframes`
    0% {
        box-shadow: inset 0 0 0 0 rgba(255, 107, 107, 0);
    }
    50% {
        box-shadow: inset 0 0 0 3px rgba(255, 107, 107, 0.8), 0 0 20px rgba(255, 107, 107, 0.5);
    }
    100% {
        box-shadow: inset 0 0 0 0 rgba(255, 107, 107, 0);
    }
`;

const Container = styled.div<{ trade_pulse: 'long' | 'short' | null }>`
    position: relative;
    width: 100%;
    height: 64px;
    border-radius: ${({ theme }) => theme.radii.md};
    overflow: visible;
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
    cursor: pointer;
    animation: ${({ trade_pulse }) =>
        trade_pulse === 'long' ? trade_pulse_long :
        trade_pulse === 'short' ? trade_pulse_short :
        'none'} 0.4s ease-out;
`;

const ButtonBase = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
`;

const Side = styled.div<{ side: 'long' | 'short'; is_active: boolean; glow_intensity: number }>`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ side }) =>
        side === 'long' ? '#00996b' : '#cc4a4a'};
    opacity: ${({ is_active }) => is_active ? 1 : 0.8};
    filter: brightness(${({ is_active, glow_intensity }) => is_active ? 1 + glow_intensity * 0.15 : 1});
    transition: opacity 0.15s ease, filter 0.1s ease;
    border-radius: ${({ side, theme }) =>
        side === 'long'
            ? `${theme.radii.md} 0 0 ${theme.radii.md}`
            : `0 ${theme.radii.md} ${theme.radii.md} 0`};
`;

const CenterInfo = styled.div<{ is_pressing: boolean; has_dots: boolean }>`
    position: absolute;
    left: 50%;
    top: 4px;
    bottom: 4px;
    transform: translateX(-50%) ${({ is_pressing }) => is_pressing ? 'scale(0.95)' : 'scale(1)'};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding-bottom: ${({ has_dots }) => has_dots ? '8px' : '0'};
    pointer-events: none;
    z-index: 2;
    width: 64px;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: transform 0.15s ease;
`;

const CoinLabel = styled.span`
    font-size: 13px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text_primary};
    letter-spacing: 0.3px;
    line-height: 1.1;
    user-select: none;
    -webkit-user-select: none;
`;

const PriceChange = styled.span<{ is_positive: boolean }>`
    font-size: 10px;
    font-weight: 600;
    color: ${({ is_positive, theme }) =>
        is_positive ? theme.colors.success : theme.colors.danger};
    line-height: 1.1;
    user-select: none;
    -webkit-user-select: none;
`;

const AmountLabel = styled.span<{ is_pulsing: boolean }>`
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.1;
    animation: ${({ is_pulsing }) => is_pulsing ? pulse_glow : 'none'} 0.3s ease-out;
    user-select: none;
    -webkit-user-select: none;
`;

const DotIndicator = styled.div`
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 3px;
`;

const Dot = styled.div<{ is_active: boolean }>`
    width: ${({ is_active }) => is_active ? '4px' : '3px'};
    height: ${({ is_active }) => is_active ? '4px' : '3px'};
    border-radius: 50%;
    background: ${({ is_active }) => is_active ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)'};
    transition: all 0.2s ease;
`;

const ProgressRing = styled.svg`
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    width: calc(100% + 6px);
    height: calc(100% + 6px);
    pointer-events: none;
    z-index: 3;
    overflow: visible;
`;

const ProgressTrack = styled.path`
    fill: none;
    stroke: rgba(0, 0, 0, 0.4);
    stroke-width: 3;
`;

const ProgressPath = styled.path<{ side: 'long' | 'short' | null }>`
    fill: none;
    stroke: ${({ side }) =>
        side === 'long' ? '#00ffaa' :
        side === 'short' ? '#ff6b6b' :
        'transparent'};
    stroke-width: 3;
    stroke-linecap: round;
    filter:
        drop-shadow(0 0 3px ${({ side }) =>
            side === 'long' ? '#00ffaa' :
            side === 'short' ? '#ff6b6b' :
            'transparent'})
        drop-shadow(0 0 8px ${({ side }) =>
            side === 'long' ? '#00ffaa' :
            side === 'short' ? '#ff6b6b' :
            'transparent'});
`;

interface RoundedProgressRingProps {
    progress: number;
    side: 'long' | 'short' | null;
}

function RoundedProgressRing({ progress, side }: RoundedProgressRingProps) {
    const width = 100;
    const height = 100;
    const radius = 12;

    const path = `
        M ${width / 2} 1
        L ${width - radius} 1
        Q ${width - 1} 1 ${width - 1} ${radius}
        L ${width - 1} ${height - radius}
        Q ${width - 1} ${height - 1} ${width - radius} ${height - 1}
        L ${radius} ${height - 1}
        Q 1 ${height - 1} 1 ${height - radius}
        L 1 ${radius}
        Q 1 1 ${radius} 1
        Z
    `;

    const perimeter = 2 * (width - 2) + 2 * (height - 2) - 8 * radius + 2 * Math.PI * radius;
    const dashOffset = perimeter * (1 - progress);

    if (progress === 0) return null;

    return (
        <ProgressRing viewBox="0 0 100 100" preserveAspectRatio="none">
            <ProgressTrack d={path} />
            <ProgressPath
                d={path}
                side={side}
                strokeDasharray={perimeter}
                strokeDashoffset={dashOffset}
            />
        </ProgressRing>
    );
}

const HintText = styled.span<{ side: 'long' | 'short' }>`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    ${({ side }) => side === 'long' ? 'left: 12px;' : 'right: 12px;'}
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    user-select: none;
    -webkit-user-select: none;
`;

export function SwipeTradeButton({
    coin,
    price_change_percent,
    amount_presets = DEFAULT_AMOUNT_PRESETS,
    initial_amount_index = 0,
    long_press_duration = 750,
    on_trade,
}: SwipeTradeButtonProps) {
    const [amount_index, set_amount_index] = useState(initial_amount_index);
    const [active_side, set_active_side] = useState<'long' | 'short' | null>(null);
    const [progress, set_progress] = useState(0);
    const [is_pressing, set_is_pressing] = useState(false);
    const [is_pulsing, set_is_pulsing] = useState(false);
    const [pulse_key, set_pulse_key] = useState(0);
    const [trade_pulse, set_trade_pulse] = useState<'long' | 'short' | null>(null);
    const [trade_pulse_key, set_trade_pulse_key] = useState(0);

    const container_ref = useRef<HTMLDivElement>(null);
    const press_timer_ref = useRef<ReturnType<typeof setTimeout> | null>(null);
    const progress_interval_ref = useRef<ReturnType<typeof setInterval> | null>(null);
    const start_x_ref = useRef<number>(0);
    const current_amount_index_ref = useRef(initial_amount_index);
    const is_dragging_ref = useRef(false);
    const is_pressing_ref = useRef(false);
    const has_changed_amount_ref = useRef(false);
    const drag_threshold = 10;

    const current_amount = amount_presets[amount_index] || amount_presets[0];

    const clear_timers = useCallback(() => {
        if (press_timer_ref.current) {
            clearTimeout(press_timer_ref.current);
            press_timer_ref.current = null;
        }
        if (progress_interval_ref.current) {
            clearInterval(progress_interval_ref.current);
            progress_interval_ref.current = null;
        }
    }, []);

    const trigger_pulse = useCallback(() => {
        set_is_pulsing(true);
        set_pulse_key(k => k + 1);
        setTimeout(() => set_is_pulsing(false), 300);
    }, []);

    const handle_pointer_down = useCallback((e: PointerEvent) => {
        if (!container_ref.current) return;

        const rect = container_ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const side: 'long' | 'short' = x < rect.width / 2 ? 'long' : 'short';

        set_active_side(side);
        set_progress(0);
        set_is_pressing(true);
        start_x_ref.current = e.clientX;
        current_amount_index_ref.current = amount_index;
        is_dragging_ref.current = false;
        is_pressing_ref.current = true;
        has_changed_amount_ref.current = false;

        const start_time = Date.now();
        progress_interval_ref.current = setInterval(() => {
            if (is_dragging_ref.current) return;

            const elapsed = Date.now() - start_time;
            const new_progress = Math.min(elapsed / long_press_duration, 1);
            set_progress(new_progress);

            if (new_progress >= 1) {
                clear_timers();
                const trade_amount = amount_presets[current_amount_index_ref.current] || amount_presets[0];
                set_trade_pulse(side);
                set_trade_pulse_key(k => k + 1);
                setTimeout(() => set_trade_pulse(null), 400);
                on_trade(coin, trade_amount, side);
                set_active_side(null);
                set_progress(0);
                set_is_pressing(false);
                is_pressing_ref.current = false;
                is_dragging_ref.current = false;
            }
        }, 16);

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, [amount_index, amount_presets, coin, long_press_duration, on_trade, clear_timers]);

    const handle_pointer_move = useCallback((e: PointerEvent) => {
        if (!is_pressing_ref.current) return;

        const delta_x = e.clientX - start_x_ref.current;

        if (!is_dragging_ref.current && Math.abs(delta_x) > drag_threshold) {
            is_dragging_ref.current = true;
            set_progress(0);
            set_active_side(null);
            set_is_pressing(false);
        }

        if (!is_dragging_ref.current) return;

        // Single swipe change - only trigger once per gesture when threshold reached
        if (!has_changed_amount_ref.current) {
            const swipe_threshold = 40; // pixels needed to trigger amount change
            const direction = delta_x < -swipe_threshold ? 1 : delta_x > swipe_threshold ? -1 : 0;

            if (direction !== 0) {
                let new_index = current_amount_index_ref.current + direction;
                // Clamp to valid range
                new_index = Math.max(0, Math.min(amount_presets.length - 1, new_index));

                if (new_index !== amount_index) {
                    set_amount_index(new_index);
                    trigger_pulse();
                    has_changed_amount_ref.current = true;
                }
            }
        }
    }, [amount_index, amount_presets.length, trigger_pulse]);

    const handle_pointer_up = useCallback((e: PointerEvent) => {
        clear_timers();
        set_active_side(null);
        set_progress(0);
        set_is_pressing(false);
        current_amount_index_ref.current = amount_index;
        is_pressing_ref.current = false;
        is_dragging_ref.current = false;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }, [clear_timers, amount_index]);

    return (
        <Container
            key={trade_pulse_key}
            ref={container_ref}
            trade_pulse={trade_pulse}
            onPointerDown={handle_pointer_down}
            onPointerMove={handle_pointer_move}
            onPointerUp={handle_pointer_up}
            onPointerCancel={handle_pointer_up}
            onContextMenu={(e) => e.preventDefault()}
        >
            <ButtonBase>
                <Side side="long" is_active={active_side === 'long'} glow_intensity={active_side === 'long' ? progress : 0}>
                    <HintText side="long">Long</HintText>
                </Side>
                <Side side="short" is_active={active_side === 'short'} glow_intensity={active_side === 'short' ? progress : 0}>
                    <HintText side="short">Short</HintText>
                </Side>
            </ButtonBase>


            <CenterInfo is_pressing={is_pressing} has_dots={amount_presets.length > 1}>
                <RoundedProgressRing progress={progress} side={active_side} />
                <CoinLabel>{coin}</CoinLabel>
                {price_change_percent !== undefined && (
                    <PriceChange is_positive={price_change_percent >= 0}>
                        {price_change_percent >= 0 ? '+' : ''}{price_change_percent.toFixed(2)}%
                    </PriceChange>
                )}
                <AmountLabel key={pulse_key} is_pulsing={is_pulsing}>${current_amount}</AmountLabel>
                {amount_presets.length > 1 && (
                    <DotIndicator>
                        {amount_presets.map((_, index) => (
                            <Dot key={index} is_active={index === amount_index} />
                        ))}
                    </DotIndicator>
                )}
            </CenterInfo>
        </Container>
    );
}
