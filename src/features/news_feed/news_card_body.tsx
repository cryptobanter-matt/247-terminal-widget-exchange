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
    display: ${({ has_content }) => has_content ? 'block' : 'none'};
`;

const ContentWrapper = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing.md};
    align-items: flex-start;

    ${container_query.min_wide} {
        gap: ${({ theme }) => theme.spacing.lg};
    }
`;

const BodyText = styled.p`
    flex: 1;
    margin: 0;
    font-size: ${({ theme }) => theme.font_sizes.small};
    color: ${({ theme }) => theme.colors.text_secondary};
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;

    ${container_query.min_wide} {
        font-size: ${({ theme }) => theme.font_sizes.medium};
        -webkit-line-clamp: 6;
    }
`;

const MediaContainer = styled.div`
    flex-shrink: 0;
    border-radius: ${({ theme }) => theme.radii.sm};
    overflow: hidden;
`;

const MediaThumbnail = styled.img`
    display: block;
    width: 80px;
    height: 80px;
    object-fit: cover;

    ${container_query.min_wide} {
        width: 120px;
        height: 120px;
    }
`;

export function NewsCardBody({ body, image, embedded_tweet }: NewsCardBodyProps) {
    const has_content = !!(body || image || embedded_tweet);

    if (!has_content) return null;

    return (
        <Container has_content={has_content}>
            {embedded_tweet ? (
                <EmbeddedTweet tweet={embedded_tweet} />
            ) : (
                <ContentWrapper>
                    {body && <BodyText>{body}</BodyText>}
                    {image && (
                        <MediaContainer>
                            <MediaThumbnail src={image} alt="" loading="lazy" />
                        </MediaContainer>
                    )}
                </ContentWrapper>
            )}
        </Container>
    );
}