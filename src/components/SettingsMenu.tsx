import { useState, useRef, useEffect, useMemo } from 'preact/hooks';
import styled from 'styled-components';
import { use_widget_store } from '../store/widget_store';
import type { ButtonStyle, LongPressDuration, UserPreferences } from '../types/widget';

interface SettingsMenuProps {
    is_open: boolean;
    on_close: () => void;
}

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
`;

const MenuContainer = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: ${({ theme }) => theme.spacing.xs};
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.lg};
    padding: ${({ theme }) => theme.spacing.md};
    width: 260px;
    z-index: 101;
    box-shadow: ${({ theme }) => theme.shadows.lg};
    box-sizing: border-box;
    overflow: hidden;
`;

const Section = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing.md};

    &:last-child {
        margin-bottom: 0;
    }
`;

const SectionLabel = styled.label`
    display: block;
    font-size: ${({ theme }) => theme.font_sizes.xs};
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text_secondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const OptionGroup = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing.xs};
`;

const OptionButton = styled.button<{ is_active: boolean }>`
    flex: 1;
    padding: ${({ theme }) => theme.spacing.sm};
    border: 1px solid ${({ is_active, theme }) => is_active ? theme.colors.border_light : theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.sm};
    background: ${({ is_active, theme }) => is_active ? theme.colors.surface_elevated : 'transparent'};
    color: ${({ is_active, theme }) => is_active ? theme.colors.text_primary : theme.colors.text_secondary};
    font-size: ${({ theme }) => theme.font_sizes.sm};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        border-color: ${({ theme }) => theme.colors.border_light};
        background: ${({ theme }) => theme.colors.surface_elevated};
        color: ${({ theme }) => theme.colors.text_primary};
    }
`;

const AmountOptionsGroup = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing.xs};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const AmountCountButton = styled.button<{ is_active: boolean }>`
    flex: 1;
    height: 36px;
    border: 1px solid ${({ is_active, theme }) => is_active ? theme.colors.border_light : theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.sm};
    background: ${({ is_active, theme }) => is_active ? theme.colors.surface_elevated : 'transparent'};
    color: ${({ is_active, theme }) => is_active ? theme.colors.text_primary : theme.colors.text_secondary};
    font-size: ${({ theme }) => theme.font_sizes.sm};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        border-color: ${({ theme }) => theme.colors.border_light};
        background: ${({ theme }) => theme.colors.surface_elevated};
        color: ${({ theme }) => theme.colors.text_primary};
    }
`;

const AmountInputsGrid = styled.div<{ count: number }>`
    display: grid;
    grid-template-columns: ${({ count }) => count === 1 ? '1fr' : count === 2 ? '1fr 1fr' : '1fr 1fr'};
    gap: ${({ theme }) => theme.spacing.xs};
`;

const AmountInputWrapper = styled.div`
    position: relative;
    min-width: 0;
`;

const AmountInputPrefix = styled.span`
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text_secondary};
    font-size: ${({ theme }) => theme.font_sizes.sm};
    pointer-events: none;
`;

const AmountInput = styled.input`
    width: 100%;
    padding: ${({ theme }) => theme.spacing.sm};
    padding-left: 22px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.sm};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text_primary};
    font-size: ${({ theme }) => theme.font_sizes.sm};
    font-weight: 500;
    text-align: left;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.border_light};
    }

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
`;

const SaveButton = styled.button`
    width: 100%;
    padding: ${({ theme }) => theme.spacing.sm};
    margin-top: ${({ theme }) => theme.spacing.md};
    border: none;
    border-radius: ${({ theme }) => theme.radii.sm};
    background: ${({ theme }) => theme.colors.success};
    color: white;
    font-size: ${({ theme }) => theme.font_sizes.sm};
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s ease;

    &:hover {
        opacity: 0.9;
    }

    &:active {
        opacity: 0.8;
    }
`;

const VALID_PRESET_COUNTS = [1, 2, 4] as const;
const LONG_PRESS_OPTIONS: { value: LongPressDuration; label: string }[] = [
    { value: 0, label: 'Instant' },
    { value: 500, label: '0.5s' },
    { value: 750, label: '0.75s' },
    { value: 1000, label: '1s' },
];

function preferences_equal(a: UserPreferences, b: UserPreferences): boolean {
    if (a.button_style !== b.button_style) return false;
    if (a.long_press_duration !== b.long_press_duration) return false;
    if (a.trade_amount_presets.length !== b.trade_amount_presets.length) return false;
    for (let i = 0; i < a.trade_amount_presets.length; i++) {
        if (a.trade_amount_presets[i] !== b.trade_amount_presets[i]) return false;
    }
    return true;
}

export function SettingsMenu({ is_open, on_close }: SettingsMenuProps) {
    const { user_preferences, set_user_preferences } = use_widget_store();
    const container_ref = useRef<HTMLDivElement>(null);

    const [local_preferences, set_local_preferences] = useState<UserPreferences>(() => ({
        ...user_preferences,
        trade_amount_presets: [...user_preferences.trade_amount_presets],
    }));

    const [preset_count, set_preset_count] = useState<1 | 2 | 4>(() => {
        const count = user_preferences.trade_amount_presets.length;
        return VALID_PRESET_COUNTS.includes(count as 1 | 2 | 4) ? (count as 1 | 2 | 4) : 2;
    });

    useEffect(() => {
        if (is_open) {
            set_local_preferences({
                ...user_preferences,
                trade_amount_presets: [...user_preferences.trade_amount_presets],
            });
            const count = user_preferences.trade_amount_presets.length;
            set_preset_count(VALID_PRESET_COUNTS.includes(count as 1 | 2 | 4) ? (count as 1 | 2 | 4) : 2);
        }
    }, [is_open, user_preferences]);

    useEffect(() => {
        const handle_click_outside = (e: MouseEvent) => {
            if (container_ref.current && !container_ref.current.contains(e.target as Node)) {
                on_close();
            }
        };

        if (is_open) {
            setTimeout(() => {
                document.addEventListener('click', handle_click_outside);
            }, 0);
        }

        return () => {
            document.removeEventListener('click', handle_click_outside);
        };
    }, [is_open, on_close]);

    const has_changes = useMemo(() => {
        return !preferences_equal(local_preferences, user_preferences);
    }, [local_preferences, user_preferences]);

    if (!is_open) return null;

    const handle_preset_count_change = (count: 1 | 2 | 4) => {
        set_preset_count(count);
        const new_presets = [...local_preferences.trade_amount_presets];

        if (count > new_presets.length) {
            const defaults = [100, 250, 500, 1000];
            while (new_presets.length < count) {
                const next_default = defaults.find(d => !new_presets.includes(d)) || (new_presets[new_presets.length - 1] || 100) * 2;
                new_presets.push(next_default);
            }
        } else {
            new_presets.length = count;
        }

        set_local_preferences(prev => ({
            ...prev,
            trade_amount_presets: new_presets,
        }));
    };

    const handle_amount_change = (index: number, value: string) => {
        const num_value = parseInt(value, 10);
        if (isNaN(num_value) || num_value < 1) return;

        const new_presets = [...local_preferences.trade_amount_presets];
        new_presets[index] = num_value;
        set_local_preferences(prev => ({
            ...prev,
            trade_amount_presets: new_presets,
        }));
    };

    const handle_button_style_change = (style: ButtonStyle) => {
        set_local_preferences(prev => ({
            ...prev,
            button_style: style,
        }));
    };

    const handle_long_press_change = (duration: LongPressDuration) => {
        set_local_preferences(prev => ({
            ...prev,
            long_press_duration: duration,
        }));
    };

    const handle_save = () => {
        set_user_preferences(local_preferences);
        on_close();
    };

    return (
        <>
            <Overlay onClick={on_close} />
            <MenuContainer ref={container_ref} onClick={(e) => e.stopPropagation()}>
                <Section>
                    <SectionLabel>Button Style</SectionLabel>
                    <OptionGroup>
                        <OptionButton
                            is_active={local_preferences.button_style === 'swipe'}
                            onClick={() => handle_button_style_change('swipe')}
                        >
                            Swipe
                        </OptionButton>
                        <OptionButton
                            is_active={local_preferences.button_style === 'standard'}
                            onClick={() => handle_button_style_change('standard')}
                        >
                            Buttons
                        </OptionButton>
                    </OptionGroup>
                </Section>

                <Section>
                    <SectionLabel>Trade Amounts</SectionLabel>
                    <AmountOptionsGroup>
                        {VALID_PRESET_COUNTS.map((count) => (
                            <AmountCountButton
                                key={count}
                                is_active={preset_count === count}
                                onClick={() => handle_preset_count_change(count)}
                            >
                                {count}
                            </AmountCountButton>
                        ))}
                    </AmountOptionsGroup>
                    <AmountInputsGrid count={preset_count}>
                        {local_preferences.trade_amount_presets.slice(0, preset_count).map((amount, index) => (
                            <AmountInputWrapper key={index}>
                                <AmountInputPrefix>$</AmountInputPrefix>
                                <AmountInput
                                    type="number"
                                    min="1"
                                    value={amount}
                                    onChange={(e) => handle_amount_change(index, (e.target as HTMLInputElement).value)}
                                />
                            </AmountInputWrapper>
                        ))}
                    </AmountInputsGrid>
                </Section>

                <Section>
                    <SectionLabel>Press Duration</SectionLabel>
                    <OptionGroup>
                        {LONG_PRESS_OPTIONS.map((option) => (
                            <OptionButton
                                key={option.value}
                                is_active={local_preferences.long_press_duration === option.value}
                                onClick={() => handle_long_press_change(option.value)}
                            >
                                {option.label}
                            </OptionButton>
                        ))}
                    </OptionGroup>
                </Section>

                {has_changes && (
                    <SaveButton onClick={handle_save}>
                        Save
                    </SaveButton>
                )}
            </MenuContainer>
        </>
    );
}
