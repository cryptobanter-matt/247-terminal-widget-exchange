import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing.xl};
    min-height: 200px;
    text-align: center;
`;

const Icon = styled.div`
    font-size: 48px;
    margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.p`
    font-size: ${({ theme }) => theme.font_sizes.md};
    color: ${({ theme }) => theme.colors.text_primary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Detail = styled.p`
    font-size: ${({ theme }) => theme.font_sizes.sm};
    color: ${({ theme }) => theme.colors.text_secondary};
`;

interface ErrorStateProps {
    message: string;
    detail?: string;
}

export function ErrorState({ message, detail }: ErrorStateProps) {
    return (
        <Container>
            <Icon>⚠</Icon>
            <Title>{message}</Title>
            {detail && <Detail>{detail}</Detail>}
        </Container>
    );
}