import styled, { keyframes } from 'styled-components';

const spin = keyframes`
    to { transform: rotate(360deg); }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing.xl};
    color: ${({ theme }) => theme.colors.text_secondary};
    min-height: 200px;
`;

const Spinner = styled.div`
    width: 32px;
    height: 32px;
    border: 3px solid ${({ theme }) => theme.colors.border};
    border-top-color: ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
`;

const Text = styled.p`
    margin-top: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.font_sizes.sm};
`;

interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
    return (
        <Container>
            <Spinner />
            <Text>{message}</Text>
        </Container>
    );
}