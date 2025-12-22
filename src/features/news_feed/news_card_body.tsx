import type { JSX } from 'preact';
import styled from 'styled-components';
import { EmbeddedTweet } from './embedded_tweet';
import type { EmbeddedTweet as EmbeddedTweetType } from '../../types/news';
import { container_query } from '../../styles/theme';

interface NewsCardBodyProps {
    body?: string;
    image?: string;
    embedded_tweet?: EmbeddedTweetType;
}

const Container = styled.div<{ has_content: boolean }>`
    display: ${({ has_content }) => has_content ? 'flex' : 'none'};
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
`;

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};

    ${container_query.min_narrow} {
        flex-direction: row;
        gap: ${({ theme }) => theme.spacing.md};
        align-items: flex-start;
    }

    ${container_query.min_wide} {
        gap: ${({ theme }) => theme.spacing.lg};
    }
`;

const BodyText = styled.p`
    flex: 1;
    margin: 0;
    font-size: ${({ theme }) => theme.font_sizes.sm};
    color: ${({ theme }) => theme.colors.text_secondary};
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;

    ${container_query.min_wide} {
        font-size: ${({ theme }) => theme.font_sizes.md};
        -webkit-line-clamp: 6;
    }
`;

const MediaContainer = styled.div`
    flex-shrink: 0;
    border-radius: ${({ theme }) => theme.radii.sm};
    overflow: hidden;
    width: 100%;
    aspect-ratio: 1;
    order: 1;

    ${container_query.min_narrow} {
        width: 80px;
        height: 80px;
        order: 0;
    }

    ${container_query.min_wide} {
        width: 120px;
        height: 120px;
    }
`;

const MediaThumbnail = styled.img`
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const InlineLink = styled.a`
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

function parse_text_with_links(text: string): (string | JSX.Element)[] {
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

export function NewsCardBody({ body, image, embedded_tweet }: NewsCardBodyProps) {
    const has_content = !!(body || image || embedded_tweet);

    if (!has_content) return null;

    if (embedded_tweet) {
        return (
            <Container has_content={has_content}>
                {body && <BodyText>{parse_text_with_links(body)}</BodyText>}
                <EmbeddedTweet tweet={embedded_tweet} />
            </Container>
        );
    }

    return (
        <ContentWrapper>
            {body && <BodyText>{parse_text_with_links(body)}</BodyText>}
            {image && (
                <MediaContainer>
                    <MediaThumbnail src={image} alt="" loading="lazy" />
                </MediaContainer>
            )}
        </ContentWrapper>
    );
}