import styled from 'styled-components';
import config from '../config/_index';

const Banner = styled.div`
    background: ${({ theme }) => theme.colors.warning};
    color: #000;
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.font_sizes.xs};
    text-align: center;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

export function SandboxBanner() {
    if (!config.trading.sandbox_mode) {
        return null;
    }

    return <Banner>Sandbox Mode - Trades Are Simulated</Banner>;
}