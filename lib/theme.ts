/**
 * Theme Configuration - Centralized Design Tokens
 *
 * This file centralizes all design tokens for consistent styling across the app.
 * Use these tokens instead of hardcoded values for:
 * - Brand consistency
 * - Easy theming updates
 * - Projector/recording readability
 */

// ═══════════════════════════════════════════════════════════════════════════
// SPACING SCALE
// ═══════════════════════════════════════════════════════════════════════════

export const spacing = {
  // Component internal spacing
  xs: 'gap-1',        // 4px
  sm: 'gap-2',        // 8px
  md: 'gap-3',        // 12px
  lg: 'gap-4',        // 16px
  xl: 'gap-6',        // 24px
  '2xl': 'gap-8',     // 32px

  // Padding scales
  padding: {
    card: 'p-6',
    cardCompact: 'p-4',
    section: 'px-4 py-8',
    banner: 'p-3',
    button: 'px-4 py-2',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY - Projector/Recording Optimized
// ═══════════════════════════════════════════════════════════════════════════

export const typography = {
  // Page titles
  pageTitle: 'text-2xl lg:text-3xl font-bold tracking-tight',

  // Section headings
  sectionTitle: 'text-lg lg:text-xl font-semibold',
  cardTitle: 'text-base lg:text-lg font-semibold',

  // Body text
  body: 'text-sm lg:text-base leading-relaxed',
  bodySmall: 'text-xs lg:text-sm',

  // Labels and captions
  label: 'text-sm font-medium',
  caption: 'text-xs text-muted-foreground',

  // Code/monospace
  mono: 'font-mono text-sm',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT - Responsive Grid System
// ═══════════════════════════════════════════════════════════════════════════

export const layout = {
  // Container widths
  container: {
    default: 'container mx-auto max-w-7xl',
    narrow: 'container mx-auto max-w-6xl',
    wide: 'container mx-auto max-w-screen-2xl',
  },

  // Runner page grid (collapses at 1024px)
  runnerGrid: 'grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8',

  // Sidebar (sticky on desktop)
  sidebar: 'lg:col-span-1 lg:sticky lg:top-24 self-start space-y-4',

  // Main content area
  mainContent: 'lg:col-span-2 space-y-6',

  // Two-column form layout
  formGrid: 'grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CARD STYLES
// ═══════════════════════════════════════════════════════════════════════════

export const cards = {
  // Standard card
  base: 'rounded-xl border bg-card text-card-foreground',

  // Card with padding
  padded: 'rounded-xl border bg-card text-card-foreground p-6',

  // Card with subtle background
  subtle: 'rounded-lg border bg-muted/30',

  // Interactive card
  interactive: 'rounded-xl border bg-card text-card-foreground hover:bg-muted/50 transition-colors cursor-pointer',

  // Status cards
  success: 'rounded-lg border border-green-500/30 bg-green-500/5',
  warning: 'rounded-lg border border-amber-500/30 bg-amber-500/5',
  error: 'rounded-lg border border-red-500/30 bg-red-500/5',
  info: 'rounded-lg border border-blue-500/30 bg-blue-500/5',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// BUTTON VARIANTS - Extended
// ═══════════════════════════════════════════════════════════════════════════

export const buttons = {
  // Primary action
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',

  // Secondary action
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',

  // Outlined
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',

  // Ghost (minimal)
  ghost: 'hover:bg-accent hover:text-accent-foreground',

  // Destructive
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',

  // Test data action (amber theme)
  testData: 'text-amber-600 border-amber-600/30 hover:bg-amber-600/10',
  testDataPrimary: 'bg-amber-600 text-white hover:bg-amber-700',

  // Link style
  link: 'text-primary underline-offset-4 hover:underline',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// STATUS INDICATORS
// ═══════════════════════════════════════════════════════════════════════════

export const status = {
  // Badge styles
  badge: {
    pending: 'bg-muted text-muted-foreground',
    running: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    error: 'bg-red-500/20 text-red-400',
    skipped: 'bg-yellow-500/20 text-yellow-400',
  },

  // Text colors
  text: {
    success: 'text-green-500',
    warning: 'text-amber-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    muted: 'text-muted-foreground',
  },

  // Icon colors
  icon: {
    success: 'text-green-500',
    warning: 'text-amber-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    loading: 'text-blue-500 animate-spin',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const animations = {
  // Loading states
  pulse: 'animate-pulse',
  spin: 'animate-spin',

  // Transitions
  fade: 'transition-opacity duration-200',
  scale: 'transition-transform duration-200',
  colors: 'transition-colors duration-200',
  all: 'transition-all duration-200',

  // Entrance animations
  slideUp: 'animate-in slide-in-from-bottom-4 fade-in duration-300',
  slideDown: 'animate-in slide-in-from-top-4 fade-in duration-300',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT PRESETS - Ready-to-use class combinations
// ═══════════════════════════════════════════════════════════════════════════

export const presets = {
  // Banner styles
  testDataBanner: 'flex items-center gap-3 p-3 rounded-lg bg-amber-600/10 border border-amber-600/20',
  errorBanner: 'flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20',
  infoBanner: 'flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20',

  // Output container
  outputContainer: 'relative rounded-xl border bg-muted/50 min-h-[200px]',

  // Skeleton loading
  skeleton: 'animate-pulse bg-muted rounded',
  skeletonText: 'animate-pulse bg-muted rounded h-4',
  skeletonTitle: 'animate-pulse bg-muted rounded h-6 w-1/3',

  // Form field wrapper
  formField: 'space-y-2',

  // Action button group
  actionGroup: 'flex items-center gap-2',

  // Step indicator
  stepIndicator: 'flex items-center gap-3 p-3 rounded-lg',
  stepActive: 'bg-blue-500/10 border border-blue-500/30',
  stepCompleted: 'bg-green-500/5',
  stepPending: 'bg-muted/30',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// PROSE/MARKDOWN STYLING
// ═══════════════════════════════════════════════════════════════════════════

export const prose = {
  // Base prose container
  container: `
    prose prose-sm sm:prose-base dark:prose-invert max-w-none p-4 overflow-x-auto
    prose-headings:scroll-mt-4
    prose-h2:text-xl prose-h2:font-bold prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:mt-8 prose-h2:mb-4
    prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
    prose-p:leading-relaxed
    prose-li:my-1
    prose-table:border prose-table:border-border
    prose-th:bg-muted prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-border
    prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-border
    prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic
    prose-strong:text-primary
  `.trim(),
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Combine multiple class strings, filtering out falsy values
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get status-based styling
 */
export function getStatusStyles(statusType: 'pending' | 'running' | 'completed' | 'error' | 'skipped') {
  return {
    badge: status.badge[statusType],
    text: status.text[statusType === 'completed' ? 'success' : statusType === 'error' ? 'error' : statusType === 'running' ? 'info' : 'muted'],
    icon: status.icon[statusType === 'completed' ? 'success' : statusType === 'error' ? 'error' : statusType === 'running' ? 'loading' : 'info'],
  };
}

export default {
  spacing,
  typography,
  layout,
  cards,
  buttons,
  status,
  animations,
  presets,
  prose,
  cn,
  getStatusStyles,
};
