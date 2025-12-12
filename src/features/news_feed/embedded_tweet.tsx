import styled from 'styled-components';
import type { EmbeddedTweet as EmbeddedTweetType } from '../../types/news';

interface EmbeddedTweetProps {
    tweet: EmbeddedTweetType;
}

const Container = styled.div`
    border: 1px dashed ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.md};
    padding: ${({ theme }) => theme.spacing.sm};
    margin-top: ${({ theme }) => theme.spacing.sm};
    background-color: ${({ theme }) => theme.colors.background};
`;

const TweetHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const TweetTitle = styled.span`
    font-weight: 600;
    font-size: ${({ theme }) => theme.font_sizes.small};
    color: ${({ theme }) => theme.colors.text_primary};
`;

const TweetBody = styled.p`
    margin: 0;
    font-size: ${({ theme }) => theme.font_sizes.small};
    color: ${({ theme }) => theme.colors.text_secondary};
    line-height: 1.4;
`;

const TweetImage = styled.img`
    width: 100%;
    max-height: 150px;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radii.sm};
    margin-top: ${({ theme }) => theme.spacing.xs};
`;

export function EmbeddedTweet({ tweet }: EmbeddedTweetProps) {
    return (
        <Container>
            <TweetHeader>
                <TweetTitle>{tweet.title}</TweetTitle>
            </TweetHeader>
            <TweetBody>{tweet.body}</TweetBody>
            {tweet.image && <TweetImage src={tweet.image} alt="" />}
        </Container>
    );
}