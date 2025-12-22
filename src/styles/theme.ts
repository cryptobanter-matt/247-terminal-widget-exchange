import config from '../config/_index';

const breakpoints = config.theme.defaults.breakpoints;

export const container_query = {
    very_narrow: `@container widget (max-width: ${breakpoints.very_narrow}px)`,
    narrow: `@container widget (max-width: ${breakpoints.narrow}px)`,
    medium: `@container widget (min-width: ${breakpoints.narrow + 1}px) and (max-width: ${breakpoints.medium}px)`,
    wide: `@container widget (min-width: ${breakpoints.medium + 1}px)`,
    min_narrow: `@container widget (min-width: ${breakpoints.very_narrow + 1}px)`,
    min_medium: `@container widget (min-width: ${breakpoints.narrow + 1}px)`,
    min_wide: `@container widget (min-width: ${breakpoints.medium + 1}px)`,
};
