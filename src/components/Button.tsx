import styled from "styled-components";

export const Button = styled.button`
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.font_sizes.medium};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text_primary};
    background-color: ${({ theme }) => theme.colors.primary};
    border: none;
    border-radius: ${({ theme }) => theme.radii.md};
    cursor: pointer;
    transition: transform 0.2s ease, background-color 0.2s ease;

    &:hover {
        background-color: #2a70e0;
    }

    &:active {
        transform: scale(0.97);
    }
`;

