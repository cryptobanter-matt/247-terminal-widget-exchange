import { useState, useRef, useCallback } from 'preact/hooks';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface SwipeTradeButtonV2Props {
    coins: string[];
    initial_coin_index?: number;
    amount_presets?: number[];
    initial_amount_index?: number;
    long_press_duration?: number;
    on_trade: (coin: string, amount: number, side: 'long' | 'short') => void;
}

const DEFAULT_AMOUNT_PRESETS = [100, 200, 300, 600];

const Container = styled.div<{ is_pulsing: boolean }>`
    position: relative;
    width: 100%;
    height: 56px;
    border-radius: ${({ theme }) => theme.radii.md};
    overflow: hidden;
    user-select: none;
    touch-action: none;
    cursor: pointer;

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        z-index: 10;
        box-shadow: ${({ is_pulsing }) => is_pulsing
            ? 'inset 0 0 0 2px rgba(255, 255, 255, 0.6), 0 0 15px rgba(255, 255, 255, 0.3)'
            : 'inset 0 0 0 0px transparent'};
        transition: box-shadow 0.15s ease-out;
    }
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

const CoinLabel = styled(motion.span)`
    font-size: 13px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text_primary};
    letter-spacing: 0.3px;
    line-height: 1;
    margin: 0;
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

const AmountLabel = styled.span`
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1;
    margin: 0;
    user-select: none;
    -webkit-user-select: none;
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

type GestureType = 'none' | 'long_press' | 'horizontal' | 'vertical';

export function SwipeTradeButtonV2({
    coins,
    initial_coin_index = 0,
    amount_presets = DEFAULT_AMOUNT_PRESETS,
    initial_amount_index = 0,
    long_press_duration = 750,
    on_trade,
}: SwipeTradeButtonV2Props) {
    const [coin_index, set_coin_index] = useState(initial_coin_index);
    const [amount_index, set_amount_index] = useState(initial_amount_index);
    const [active_side, set_active_side] = useState<'long' | 'short' | null>(null);
    const [progress, set_progress] = useState(0);
    const [is_pressing, set_is_pressing] = useState(false);
    const [is_pulsing, set_is_pulsing] = useState(false);

    const container_ref = useRef<HTMLDivElement>(null);
    const press_timer_ref = useRef<ReturnType<typeof setTimeout> | null>(null);
    const progress_interval_ref = useRef<ReturnType<typeof setInterval> | null>(null);
    const pulse_timer_ref = useRef<ReturnType<typeof setTimeout> | null>(null);
    const start_x_ref = useRef<number>(0);
    const start_y_ref = useRef<number>(0);
    const current_amount_index_ref = useRef(initial_amount_index);
    const current_coin_index_ref = useRef(initial_coin_index);
    const is_interacting_ref = useRef(false);
    const gesture_type_ref = useRef<GestureType>('none');
    const has_changed_coin_ref = useRef(false);
    const has_changed_amount_ref = useRef(false);
    const drag_threshold = 10;

    const current_coin = coins[coin_index] || coins[0];
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
        if (pulse_timer_ref.current) {
            clearTimeout(pulse_timer_ref.current);
        }
        set_is_pulsing(true);
        pulse_timer_ref.current = setTimeout(() => {
            set_is_pulsing(false);
        }, 150);
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
        start_y_ref.current = e.clientY;
        current_amount_index_ref.current = amount_index;
        current_coin_index_ref.current = coin_index;
        is_interacting_ref.current = true;
        gesture_type_ref.current = 'long_press';
        has_changed_coin_ref.current = false;
        has_changed_amount_ref.current = false;

        const start_time = Date.now();
        progress_interval_ref.current = setInterval(() => {
            if (gesture_type_ref.current !== 'long_press') return;

            const elapsed = Date.now() - start_time;
            const new_progress = Math.min(elapsed / long_press_duration, 1);
            set_progress(new_progress);

            if (new_progress >= 1) {
                clear_timers();
                const trade_amount = amount_presets[current_amount_index_ref.current] || amount_presets[0];
                on_trade(coins[current_coin_index_ref.current], trade_amount, side);
                set_active_side(null);
                set_progress(0);
                set_is_pressing(false);
                is_interacting_ref.current = false;
                gesture_type_ref.current = 'none';
            }
        }, 16);

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, [amount_index, amount_presets, coin_index, coins, long_press_duration, on_trade, clear_timers]);

    const handle_pointer_move = useCallback((e: PointerEvent) => {
        if (!is_interacting_ref.current) return;

        const delta_x = e.clientX - start_x_ref.current;
        const delta_y = e.clientY - start_y_ref.current;

        if (gesture_type_ref.current === 'long_press') {
            const abs_x = Math.abs(delta_x);
            const abs_y = Math.abs(delta_y);

            if (abs_x > drag_threshold || abs_y > drag_threshold) {
                if (abs_x > abs_y) {
                    gesture_type_ref.current = 'horizontal';
                } else {
                    gesture_type_ref.current = 'vertical';
                }
                set_progress(0);
                set_active_side(null);
                set_is_pressing(false);
            }
        }

        if (gesture_type_ref.current === 'horizontal' && !has_changed_coin_ref.current) {
            const direction = delta_x < -20 ? 1 : delta_x > 20 ? -1 : 0;

            if (direction !== 0) {
                let new_index = current_coin_index_ref.current + direction;

                if (new_index >= coins.length) {
                    new_index = 0;
                } else if (new_index < 0) {
                    new_index = coins.length - 1;
                }

                if (new_index !== coin_index) {
                    set_coin_index(new_index);
                    has_changed_coin_ref.current = true;
                }
            }
        }

        if (gesture_type_ref.current === 'vertical' && !has_changed_amount_ref.current) {
            // Much larger threshold (100px) for discrete preset changes - requires deliberate swipe
            const direction = delta_y < -100 ? 1 : delta_y > 100 ? -1 : 0;

            if (direction !== 0) {
                let new_index = current_amount_index_ref.current + direction;

                // Clamp to valid range (no wrap-around for amounts)
                new_index = Math.max(0, Math.min(amount_presets.length - 1, new_index));

                if (new_index !== amount_index) {
                    set_amount_index(new_index);
                    trigger_pulse();
                    has_changed_amount_ref.current = true;
                }
            }
        }
    }, [amount_index, amount_presets, coin_index, coins.length, trigger_pulse]);

    const handle_pointer_up = useCallback((e: PointerEvent) => {
        clear_timers();
        set_active_side(null);
        set_progress(0);
        set_is_pressing(false);
        current_amount_index_ref.current = amount_index;
        current_coin_index_ref.current = coin_index;
        is_interacting_ref.current = false;
        gesture_type_ref.current = 'none';
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }, [clear_timers, amount_index, coin_index]);

    const wheel_cooldown_ref = useRef(false);

    const handle_wheel = useCallback((e: WheelEvent) => {
        e.preventDefault();

        // Debounce wheel events - 400ms cooldown for deliberate scrolling
        if (wheel_cooldown_ref.current) return;
        wheel_cooldown_ref.current = true;
        setTimeout(() => { wheel_cooldown_ref.current = false; }, 400);

        const direction = e.deltaY > 0 ? -1 : 1;
        const new_index = Math.max(0, Math.min(amount_presets.length - 1, amount_index + direction));

        if (new_index !== amount_index) {
            set_amount_index(new_index);
            current_amount_index_ref.current = new_index;
            trigger_pulse();
        }
    }, [amount_index, amount_presets, trigger_pulse]);

    return (
        <Container
            ref={container_ref}
            is_pulsing={is_pulsing}
            onPointerDown={handle_pointer_down}
            onPointerMove={handle_pointer_move}
            onPointerUp={handle_pointer_up}
            onPointerCancel={handle_pointer_up}
            onWheel={handle_wheel}
        >
            <ButtonBase>
                <Side side="long" is_active={active_side === 'long'} glow_intensity={active_side === 'long' ? progress : 0}>
                    <HintText side="long">Long</HintText>
                </Side>
                <Side side="short" is_active={active_side === 'short'} glow_intensity={active_side === 'short' ? progress : 0}>
                    <HintText side="short">Short</HintText>
                </Side>
            </ButtonBase>


            <CenterInfo is_pressing={is_pressing} has_dots={coins.length > 1}>
                <RoundedProgressRing progress={progress} side={active_side} />
                <CoinLabel
                    key={current_coin}
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                >
                    {current_coin}
                </CoinLabel>
                <AmountLabel>${current_amount}</AmountLabel>
                {coins.length > 1 && (
                    <DotIndicator>
                        {coins.map((_, index) => (
                            <Dot key={index} is_active={index === coin_index} />
                        ))}
                    </DotIndicator>
                )}
            </CenterInfo>
        </Container>
    );
}
