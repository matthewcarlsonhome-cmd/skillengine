/**
 * Confetti - CSS-based celebration animation
 *
 * Features:
 * - Pure CSS animation (no dependencies)
 * - Customizable colors and count
 * - Auto-cleanup
 * - Performant with CSS transforms
 */

import React, { useEffect, useState, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
}

export interface ConfettiProps {
  isActive: boolean;
  count?: number;
  duration?: number;
  colors?: string[];
  onComplete?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT COLORS
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#95E1D3', // Mint
  '#F38181', // Coral
  '#AA96DA', // Purple
  '#FCBAD3', // Pink
  '#A8D8EA', // Sky blue
];

// ═══════════════════════════════════════════════════════════════════════════
// CONFETTI COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const Confetti: React.FC<ConfettiProps> = ({
  isActive,
  count = 50,
  duration = 3000,
  colors = DEFAULT_COLORS,
  onComplete,
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  // Generate confetti pieces
  useEffect(() => {
    if (isActive) {
      const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 500,
        duration: duration + Math.random() * 1000,
        size: 8 + Math.random() * 8,
        rotation: Math.random() * 360,
      }));
      setPieces(newPieces);

      // Cleanup after animation
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, duration + 1500);

      return () => clearTimeout(timer);
    } else {
      setPieces([]);
    }
  }, [isActive, count, duration, colors, onComplete]);

  if (pieces.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${piece.rotation}deg)`,
            animation: `confetti-fall ${piece.duration}ms ease-out ${piece.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// USE CONFETTI HOOK
// ═══════════════════════════════════════════════════════════════════════════

export interface UseConfettiReturn {
  isActive: boolean;
  trigger: () => void;
  ConfettiComponent: React.FC;
}

export const useConfetti = (options?: Partial<ConfettiProps>): UseConfettiReturn => {
  const [isActive, setIsActive] = useState(false);

  const trigger = useCallback(() => {
    setIsActive(true);
  }, []);

  const handleComplete = useCallback(() => {
    setIsActive(false);
  }, []);

  const ConfettiComponent: React.FC = () => (
    <Confetti
      isActive={isActive}
      onComplete={handleComplete}
      {...options}
    />
  );

  return { isActive, trigger, ConfettiComponent };
};

// ═══════════════════════════════════════════════════════════════════════════
// CELEBRATION OVERLAY - Full celebration with message
// ═══════════════════════════════════════════════════════════════════════════

export interface CelebrationProps {
  isVisible: boolean;
  title: string;
  subtitle?: string;
  emoji?: string;
  onDismiss: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export const Celebration: React.FC<CelebrationProps> = ({
  isVisible,
  title,
  subtitle,
  emoji = '🎉',
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 4000,
}) => {
  useEffect(() => {
    if (isVisible && autoDismiss) {
      const timer = setTimeout(onDismiss, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoDismiss, autoDismissDelay, onDismiss]);

  if (!isVisible) return null;

  return (
    <>
      {/* Confetti */}
      <Confetti isActive={isVisible} count={80} duration={3500} />

      {/* Message overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        aria-live="polite"
      >
        <div className="bg-card/95 backdrop-blur-sm border rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-300 pointer-events-auto max-w-sm mx-4 text-center">
          <div className="text-6xl mb-4 animate-bounce">{emoji}</div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
          <button
            onClick={onDismiss}
            className="mt-6 px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// FIRST SKILL CELEBRATION - Specific celebration for first skill run
// ═══════════════════════════════════════════════════════════════════════════

export const useFirstSkillCelebration = () => {
  const [showCelebration, setShowCelebration] = useState(false);
  const STORAGE_KEY = 'skillengine_first_skill_celebrated';

  const checkAndCelebrate = useCallback(() => {
    const hasCelebrated = localStorage.getItem(STORAGE_KEY);
    if (!hasCelebrated) {
      setShowCelebration(true);
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, []);

  const dismiss = useCallback(() => {
    setShowCelebration(false);
  }, []);

  const CelebrationComponent: React.FC = () => (
    <Celebration
      isVisible={showCelebration}
      title="First Skill Complete!"
      subtitle="You're on your way to productivity greatness."
      emoji="🚀"
      onDismiss={dismiss}
    />
  );

  return { checkAndCelebrate, CelebrationComponent };
};

export default Confetti;
