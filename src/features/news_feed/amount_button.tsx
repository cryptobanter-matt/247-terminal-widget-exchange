import styled from 'styled-components';

interface AmountButtonProps {
    amount: number;
    side: 'long' | 'short';
    on_click: (amount: number, side: 'long' | 'short') => void;
}

const Button = styled.button<{ side: 'long' | 'short' }>`
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    min-width: 60px;
    font-size: ${({ theme }) => theme.font_sizes.small};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text_primary};
    background-color: ${({ theme, side }) =>
        side === 'long' ? theme.colors.success : theme.colors.danger
    };
    border: none;
    border-radius: ${({ theme }) => theme.radii.sm};
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover {
        opacity: 0.85;
    }

    &:active {
        opacity: 0.7;
    }
`;

export function AmountButton({ amount, side, on_click }: AmountButtonProps) {
    const handle_click = () => {
        on_click(amount, side);
    };

    return (
        <Button side={side} onClick={handle_click}>
            ${amount}
        </Button>
    );
}