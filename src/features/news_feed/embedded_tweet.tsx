import styled from 'styled-components';
import type { EmbeddedTweet as EmbeddedTweetType } from '../../types/news';
import { ExternalLinkIcon } from '../../components/icons';

interface EmbeddedTweetProps {
    tweet: EmbeddedTweetType;
}

const Container = styled.div`
    border: 1px dashed ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.md};
    padding: ${({ theme }) => theme.spacing.sm};
    background-color: ${({ theme }) => theme.colors.background};
`;

const TweetHeader = styled.a`
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    text-decoration: none;
    transition: color 0.15s ease;

    &:hover span {
        color: ${({ theme }) => theme.colors.primary};
    }

    &:hover svg {
        color: ${({ theme }) => theme.colors.primary};
    }
`;

const TweetTitle = styled.span`
    font-weight: 600;
    font-size: ${({ theme }) => theme.font_sizes.sm};
    color: ${({ theme }) => theme.colors.text_primary};
    transition: color 0.15s ease;
`;

const LinkIcon = styled.span`
    color: ${({ theme }) => theme.colors.text_secondary};
    display: inline-flex;
    align-items: center;
    transition: color 0.15s ease;
`;

const TweetBody = styled.p`
    margin: 0;
    font-size: ${({ theme }) => theme.font_sizes.sm};
    color: ${({ theme }) => theme.colors.text_secondary};
    line-height: 1.4;
`;

const TweetImage = styled.img`
    display: block;
    width: 100%;
    max-height: 200px;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radii.sm};
    margin-top: ${({ theme }) => theme.spacing.sm};
`;

const InlineLink = styled.a`
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

function parse_text_with_links(text: string) {
    const url_regex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(url_regex);

    return parts.map((part, index) => {
        if (url_regex.test(part)) {
            url_regex.lastIndex = 0;
            return (
                <InlineLink
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </InlineLink>
            );
        }
        return part;
    });
}

export function EmbeddedTweet({ tweet }: EmbeddedTweetProps) {
    const handle_click = (e: MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <Container>
            <TweetHeader
                href={tweet.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handle_click}
            >
                <TweetTitle>@{tweet.author_handle}</TweetTitle>
                {tweet.link && (
                    <LinkIcon>
                        <ExternalLinkIcon size={12} />
                    </LinkIcon>
                )}
            </TweetHeader>
            <TweetBody>{parse_text_with_links(tweet.text)}</TweetBody>
            {tweet.image && (
                <TweetImage src={tweet.image} alt="" loading="lazy" />
            )}
        </Container>
    );
}