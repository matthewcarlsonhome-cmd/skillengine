/**
 * PageTransition - CSS-based page transition wrapper
 *
 * Features:
 * - Fade and slide animations
 * - Multiple animation variants
 * - Respects reduced motion preference
 * - No external dependencies
 */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type TransitionVariant = 'fade' | 'slideUp' | 'slideLeft' | 'scale' | 'none';

export interface PageTransitionProps {
  children: React.ReactNode;
  variant?: TransitionVariant;
  duration?: number;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION STYLES
// ═══════════════════════════════════════════════════════════════════════════

const getAnimationStyles = (variant: TransitionVariant, isVisible: boolean, duration: number) => {
  const base = {
    transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
  };

  const variants: Record<TransitionVariant, { initial: React.CSSProperties; visible: React.CSSProperties }> = {
    fade: {
      initial: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slideUp: {
      initial: { opacity: 0, transform: 'translateY(20px)' },
      visible: { opacity: 1, transform: 'translateY(0)' },
    },
    slideLeft: {
      initial: { opacity: 0, transform: 'translateX(20px)' },
      visible: { opacity: 1, transform: 'translateX(0)' },
    },
    scale: {
      initial: { opacity: 0, transform: 'scale(0.95)' },
      visible: { opacity: 1, transform: 'scale(1)' },
    },
    none: {
      initial: {},
      visible: {},
    },
  };

  return {
    ...base,
    ...(isVisible ? variants[variant].visible : variants[variant].initial),
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// PAGE TRANSITION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  variant = 'slideUp',
  duration = 300,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Trigger animation on mount and route change
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const effectiveVariant = prefersReducedMotion ? 'none' : variant;
  const styles = getAnimationStyles(effectiveVariant, isVisible, duration);

  return (
    <div style={styles} className={className}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED CONTAINER - For individual elements
// ═══════════════════════════════════════════════════════════════════════════

export interface AnimatedContainerProps {
  children: React.ReactNode;
  variant?: TransitionVariant;
  delay?: number;
  duration?: number;
  className?: string;
  show?: boolean;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  variant = 'slideUp',
  delay = 0,
  duration = 300,
  className,
  show = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, delay]);

  const effectiveVariant = prefersReducedMotion ? 'none' : variant;
  const styles = getAnimationStyles(effectiveVariant, isVisible, duration);

  return (
    <div style={{ ...styles, transitionDelay: `${delay}ms` }} className={className}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STAGGERED LIST - Animate list items with delay
// ═══════════════════════════════════════════════════════════════════════════

export interface StaggeredListProps {
  children: React.ReactNode[];
  variant?: TransitionVariant;
  staggerDelay?: number;
  duration?: number;
  className?: string;
  itemClassName?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  variant = 'slideUp',
  staggerDelay = 50,
  duration = 300,
  className,
  itemClassName,
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <AnimatedContainer
          key={index}
          variant={variant}
          delay={index * staggerDelay}
          duration={duration}
          className={itemClassName}
        >
          {child}
        </AnimatedContainer>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// FADE IN WHEN VISIBLE - Intersection Observer based
// ═══════════════════════════════════════════════════════════════════════════

export interface FadeInWhenVisibleProps {
  children: React.ReactNode;
  variant?: TransitionVariant;
  duration?: number;
  threshold?: number;
  className?: string;
}

export const FadeInWhenVisible: React.FC<FadeInWhenVisibleProps> = ({
  children,
  variant = 'slideUp',
  duration = 500,
  threshold = 0.1,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const effectiveVariant = prefersReducedMotion ? 'none' : variant;
  const styles = getAnimationStyles(effectiveVariant, isVisible, duration);

  return (
    <div ref={ref} style={styles} className={className}>
      {children}
    </div>
  );
};

export default PageTransition;
