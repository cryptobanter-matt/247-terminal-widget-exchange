import styled from 'styled-components';

export const WidgetContainer = styled.div`
    container-type: inline-size;
    container-name: widget;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: ${({ theme }) => theme.spacing.md};
    background: ${({ theme }) => theme.colors.background};
    box-sizing: border-box;
`;
