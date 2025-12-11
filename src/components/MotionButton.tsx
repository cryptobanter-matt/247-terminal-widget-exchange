import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ComponentChildren } from 'preact';

interface MotionButtonProps {
    children: ComponentChildren;
    onClick?: () => void;
    disabled?: boolean;
}

const StyledButton = styled.button`
    /* ... all the same CSS from the previous Button example ... */
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.font_sizes.medium};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text_primary};
    background-color: ${({ theme }) => theme.colors.primary};
    border: none;
    border-radius: ${({ theme }) => theme.radii.md};
    cursor: pointer;
`;

export const MotionButton = (props: MotionButtonProps) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
        <StyledButton {...props} />
    </motion.div>
);