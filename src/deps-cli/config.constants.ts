/** Left margin applied to all non-clack table rows so they align with clack prompt output. */
export const CLACK_LEFT_MARGIN = ' '.repeat(3);

/**
 * Net column-width compensation for clack multiselect labels.
 *
 * Clack's multiselect renders `│ □ ` (guide bar + checkbox) before each label — 5 visible chars.
 * `CLACK_LEFT_MARGIN` is 3 chars. The difference (2) is how much further right multiselect label content
 * starts compared to a plain table row. Narrow the first column by this amount in any table used to generate
 * multiselect labels, so subsequent columns stay aligned with the static table above.
 */
export const CLACK_MULTISELECT_PREFIX_WIDTH = 2;
