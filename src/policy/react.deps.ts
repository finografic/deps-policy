import type { DependencyGroup } from 'deps.types';

/**
 * Additional deps for `genx:type:react` packages.
 *
 * Before this group existed, genx mapped its `react` package type onto `library` for policy
 * purposes, because there was nothing else to map it to. That borrow is why React-specific
 * versions had to live in genx's `reactVite` feature rather than here.
 *
 * Kept separate from `library` rather than folded into it: `library` also governs packages
 * like `@finografic/core`, which must never take on a React dependency — that is the whole
 * reason the viewport scale lives in `core` and not in `@finografic/react`.
 */
export const react: DependencyGroup = {
  dependencies: {
    // Hooks for browser APIs — useMediaQuery, useBreakpoint, useIsMobile and friends.
    // Reads its breakpoint scale from `@finografic/core/viewport`.
    '@finografic/react': '^0.13.1',
  },
};
